# DDD aggregates with Debezium and Kafka Streams

## Introduction / Motivation
(Micro)Service-based architectures can be considered an industry trend and are thus
often found in enterprise applications lately. One possible way to keep data
synchronized across services and their baking data stores is to make us of an approach
called [change-data-capture](https://vladmihalcea.com/a-beginners-guide-to-cdc-change-data-capture/) or CDC for short.
Essentially it allows to listen to any modifications which are occurring at one end of a data flow (i.e. the data source)
and communicate them as change events to other interested parties or storing them into a data sink.
Instead of doing this in a point-to-point fashion, it's advisable to decouple this flow of events
between data sources and data sinks. Such a scenario can be implemented based on [Debezium](http://debezium.io/)
and [Apache Kafka](https://kafka.apache.org/) with relative ease and effectively no coding.

There are use cases however, where things are a bit more tricky. It is sometimes
useful to share information across services and data stores by means of so-called
aggregates, which are a concept/pattern defined by domain-driven design (DDD).
In general, a [DDD aggregate](https://martinfowler.com/bliki/DDD_Aggregate.html) is used
to transfer state which can be comprised of multiple different domain objects that are
together treated as a single unit of information. Concrete examples would be:

* **customers and their addresses** which are represented as a customer record aggregate
storing a customer and a list of addresses

* **orders and corresponding line items** which are represented as an order record
aggregate storing an order and all its line items

Chances are that the data of the involved domain objects backing these DDD aggregates are stored in 
separate relations of an RDBMS. When making use of the CDC capabilities currently found
in Debezium, all changes to domain objects will be independently captured and eventually
reflected in separate Kafka topics, one per RDBMS relation. While this behaviour
is tremendously helpful for a lot of use cases it can be pretty limiting to others,
like the DDD aggregate scenario described above. Therefore, this blog post tries to present a
first idea/PoC towards building DDD aggregates with Kafka Streams based on Debezium CDC events.

## Capture change events from data sources

_//TODO: @gunnar describe the db schema relations customers and addresses as well as the setup of mysql and dbz source connector to get cdc events stored into two kafka topics..._

```json
{
  "name": "dbz-mysql-source",
  "config": {
    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
    "database.hostname": "localhost",
    "database.port": "3306",
    "database.user": "kafka",
    "database.password": "kafka",
    "database.server.id": "12345",
    "database.server.name": "localdemo",
    "database.whitelist": "kafka_connect",
    "table.whitelist": "kafka_connect.customers,kafka_connect.addresses",
    "database.history.kafka.bootstrap.servers": "localhost:9092",
    "database.history.kafka.topic": "dbhist.localdemo",
    "include.schema.changes": "true",
    "key.converter": "org.apache.kafka.connect.json.JsonConverter",
    "key.converter.schemas.enable": "true",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "true",
    "transforms":"key,value",
	"transforms.key.type":"io.debezium.transforms.UnwrapFromEnvelope",
	"transforms.key.drop.tombstones":"false",
	"transforms.value.type":"io.debezium.transforms.UnwrapFromEnvelope",
	"transforms.value.drop.tombstones":"false"
  }
}
```

## Building DDD aggregates

The KStreams application is going to process data from two Kafka topics, namely X and Y. These topics
receive CDC events based on the customers and addresses relations found in MySQL, each of which has its
corresponding Jackson-annotated POJO ([Customer](https://github.com/hpgrahsl/kafka-streams-ddd-aggregator/blob/blog-post-sample/src/main/java/com/github/hpgrahsl/kafka/model/Customer.java) and
 [Address](https://github.com/hpgrahsl/kafka-streams-ddd-aggregator/blob/blog-post-sample/src/main/java/com/github/hpgrahsl/kafka/model/Address.java)), 
enriched by a field holding the CDC event type (i.e. UPSERT/DELETE) for easier handling during the KStreams processing.

Since the Kafka topic records are in Debezium JSON format with unwrapped envelopes, a special **SerDe**  
has been written in order to be able to read/write these records using their POJO or Debezium event representation respectively.
While the serializer simply converts the POJOs into JSON using Jackson, the deserializer is a "hybrid"
one, being able to deserialize from either Debezium CDC events or jsonified POJOs.

With that in place, the KStreams topology to create and maintain DDD aggregates on-the-fly can be built as follows:

#### Customers topic ("parent")
All the customer records are simply read from the customer topic into a **KTable** which will automatically maintain
the latest state per customer according to the record key (i.e. the customer's PK)

```java
        KTable<DefaultId, Customer> customerTable = 
                builder.table(parentTopic, Consumed.with(defaultIdSerde,customerSerde));
```

#### Addresses topic ("children")
For the address records the processing is a bit more involved and needs several steps. First, all the address
records are read into a **KStream**. 

```java
        KStream<DefaultId, Address> addressStream = builder.stream(childrenTopic,
                Consumed.with(defaultIdSerde, addressSerde));
```

Second, a 'pseudo' grouping of these address records is done based on their keys (the original primary key in the relation),
During this step the relationships towards the corresponding customer records are maintained. This effectively allows to keep
track which address record belongs to which customer record, even in the light of address record deletions.
To achieve this an additional _LatestAddress_ POJO is introduced which allows to store the latest known PK <-> FK
relation in addition to the _Address_ record itself.  

```java
        KTable<DefaultId,LatestAddress> tempTable = addressStream
                .groupByKey(Serialized.with(defaultIdSerde, addressSerde))
                .aggregate(
                        () -> new LatestAddress(),
                        (DefaultId addressId, Address address, LatestAddress latest) -> {
                            latest.update(address,addressId,new DefaultId(address.getCustomer_id()));
                            return latest;
                        },
                        Materialized.as(childrenTopic+"_table_temp")
                                .withKeySerde((Serde)defaultIdSerde)
                                    .withValueSerde(latestAddressSerde)
                );
```
Third, the intermediate **KTable** is again converted to a **KStream**. The _LatestAddress_ records are transformed
to have the customer id (FK relationship) as their new key in order to group them per customer.
During the grouping step, customer specific addresses are updated which can result in an address 
record being added or deleted. For this purpose, another POJO called _Addresses_ is introduced, which
holds a map of address records that gets updated accordingly. The result is a **KTable** holding the
most recent _Addresses_ per customer id.

```java
        KTable<DefaultId, Addresses> addressTable = tempTable.toStream()
                .map((addressId, latestAddress) -> new KeyValue<>(latestAddress.getCustomerId(),latestAddress))
                .groupByKey(Serialized.with(defaultIdSerde,latestAddressSerde))
                .aggregate(
                        () -> new Addresses(),
                        (customerId, latestAddress, addresses) -> {
                            addresses.update(latestAddress);
                            return addresses;
                        },
                        Materialized.as(childrenTopic+"_table_aggregate")
                                .withKeySerde((Serde)defaultIdSerde)
                                    .withValueSerde(addressesSerde)
                );
```

#### Combine customers with addresses
Finally, it's easy to bring customers and addresses together by **joining the customers KTable with
the addresses KTable** and thereby building the DDD aggregates which are represented by the _CustomerAddressAggregate_ POJO.
At the end, the KTable changes are written to a KStream, which in turn gets saved into a kafka topic.
This allows to make use of the resulting DDD aggregates in manifold ways.  
  
```java
        KTable<DefaultId,CustomerAddressAggregate> dddAggregate =
                  customerTable.join(addressTable, (customer, addresses) ->
                      customer.get_eventType() == EventType.DELETE ?
                              null : new CustomerAddressAggregate(customer,addresses.getEntries())
                  );
  
          dddAggregate.toStream().to("final_ddd_aggregates",
                                      Produced.with(defaultIdSerde,(Serde)aggregateSerde));
```

_Note: that records in the customers KTable might receive a CDC delete event. If so, this can be detected by
checking the event type field of the customer POJO and e.g. return 'null' instead of a DDD aggregate.
Such a convention can be helpful whenever consuming parties also need to act to deletions accordingly._
                               
## Transfer DDD aggregates to data sinks

We originally set out to build these DDD aggregates in order to transfer data and synchronize changes between
a data source (MySQL tables in this case) and a convenient data sink. By definition,
DDD aggregates are typically complex data structures and therefore it makes perfect sense to write them
to data stores which offer flexibel ways and means to index and/or query them. Talking about NoSQL databases a
document store seems the most natural choice with [MongoDB](https://www.mongodb.com/) being the leading database 
for such use cases.

Thanks to [Kafka Connect](https://kafka.apache.org/documentation/#connect) and numerous turn-key ready 
[connectors](https://www.confluent.io/product/connectors/) it is almost effortless to get this done. 
Using a [MongoDB sink connector](https://github.com/hpgrahsl/kafka-connect-mongodb) from the open-source community,
it is easy to have the DDD aggregates written into MongoDB. All it needs is a proper configuration which can be posted
to the [REST API](https://docs.confluent.io/current/connect/restapi.html) of Kafka Connect in order to run the connector.

In case the DDD aggregates should get written unmodified into MongoDB, a configuration may look as simple as follows:

```json
{
 "name": "mdb-sink-01",
 "config": {
    "key.converter":"org.apache.kafka.connect.json.JsonConverter",
    "key.converter.schemas.enable":"false",
    "value.converter":"org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable":"false",
    "connector.class": "at.grahsl.kafka.connect.mongodb.MongoDbSinkConnector",
    "tasks.max": "1",
    "topics": "final_ddd_aggregates",
    "mongodb.connection.uri":"mongodb://localhost:27017/kafkaconnect?w=1&journal=true",
    "mongodb.collection":"customer_aggregates",
    "mongodb.document.id.strategy":"at.grahsl.kafka.connect.mongodb.processor.id.strategy.FullKeyStrategy"
 }
}
```

which will result in **MongoDB documents** in the _customer_aggregates_ collection looking like:

```json
{
    "_id": {
        "id": "1001"
    },
    "addresses": [
        {
            "zip": "76036",
            "_eventType": "UPSERT",
            "city": "Euless",
            "street": "3183 Moore Avenue",
            "id": "10",
            "state": "Texas",
            "customer_id": "1001",
            "type": "SHIPPING"
        },
        {
            "zip": "17116",
            "_eventType": "UPSERT",
            "city": "Harrisburg",
            "street": "2389 Hidden Valley Road",
            "id": "11",
            "state": "Pennsylvania",
            "customer_id": "1001",
            "type": "BILLING"
        }
    ],
    "customer": {
        "_eventType": "UPSERT",
        "last_name": "Thomas",
        "id": "1001",
        "first_name": "Sally",
        "email": "sally.thomas@acme.com"
    }
}
```

Due to the combination of the data in a single document some parts aren't needed or redundant. To get rid of any
unwanted data (e.g. _eventType, customer_id of each address sub-document) it would also be possible
to adapt the configuration in order to blacklist said fields.

## Drawbacks and limitations
While this first naïve version basically works it is very important to understand its current limitations:

* not generically applicable thus needs custom code for POJOs and intermediate types
* cannot be scaled across multiple instances as is due to missing but necessary data repartitioning prior to processing
* limited to building aggregates based on a single JOIN between 1:N relationships
* resulting DDD aggregates are eventually consistent meaning that it is possible for them to temporarily exhibit intermediate state before converging 

The first few can be addressed with a reasonable amount of work on the KStreams application. The last one, 
dealing with the eventually consistent nature of resulting DDD aggregates is much harder to correct
and would need considerable efforts at Debezium's own CDC mechanism. 

## Outlook

_//TODO: give a glimpse on planned upcoming blog posts..._
