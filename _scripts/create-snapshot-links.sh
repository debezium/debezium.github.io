#!/bin/bash
# Maven Central does not provide a permanent link to latest snapshot
# The script thus obtain the latest snapshot version and updates the links in documentation to point to it

MAVEN_REPO="https://central.sonatype.com/repository/maven-snapshots"
GROUP_ID="io/debezium"
FILE_EXT="tar.gz"
ANTORA_FILE="playbook.yml"
CONNECTORS=(mysql mongodb postgres sqlserver oracle db2 jdbc spanner vitess informix ibmi mariadb cassandra-3 cassandra-4 cassandra-5 cockroachdb)

# Fetch the latest Debezium snapshot version
DEBEZIUM_VERSION=$(curl --silent -fSL $MAVEN_REPO/$GROUP_ID/debezium-bom/maven-metadata.xml | sed -n 's/.*<version>\([^<]*\)<\/version>.*/\1/p' | tail -1)
echo "Resolved Debezium Snapshot Version: $DEBEZIUM_VERSION"

update_snapshot_link() {
    local COMPONENT=$1
    local ARTIFACT_ID=$2
    local CLASSIFIER=$3
    local MAX_RETRIES=3
    local RETRY_DELAY=5

    echo "Fetching $COMPONENT metadata"
    for ((i=1; i<=MAX_RETRIES; i++)); do
      SNAPSHOT_VERSION=$(curl --connect-timeout 10 --max-time 30 --silent -fSL $MAVEN_REPO/$GROUP_ID/$ARTIFACT_ID/$DEBEZIUM_VERSION/maven-metadata.xml | awk -F'<[^>]+>' '/<extension>tar.gz<\/extension>/ {getline; print $2; exit}')

      if [[ -n "$SNAPSHOT_VERSION" ]]; then
        break
      fi

      echo " Attempt $i/$MAX_RETRIES failed for $COMPONENT, retrying"
      sleep "$RETRY_DELAY"
      RETRY_DELAY=$((RETRY_DELAY * 2))
    done

    if [[ -z "$SNAPSHOT_VERSION" ]]; then
      echo "ERROR: Failed to resolve snapshot for $COMPONENT after $MAX_RETRIES retries"
      return 1
    fi

    SNAPSHOT_LINK="$MAVEN_REPO/$GROUP_ID/$ARTIFACT_ID/$DEBEZIUM_VERSION/$ARTIFACT_ID-${SNAPSHOT_VERSION}${CLASSIFIER}.tar.gz"
    sed -i "s#link-$COMPONENT-snapshot:.*#link-$COMPONENT-snapshot: \'$SNAPSHOT_LINK\'#" $ANTORA_FILE
    echo "Updated $COMPONENT as $SNAPSHOT_LINK"
}

for CONNECTOR in "${CONNECTORS[@]}"; do
    update_snapshot_link "$CONNECTOR-plugin" "debezium-connector-$CONNECTOR" "-plugin"
done

update_snapshot_link "server" "debezium-server-dist" ""
