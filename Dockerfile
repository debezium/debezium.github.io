# this file exists because Docker Hub can't make images out of build stages
# so this is a bit redundant with Dockerfile in this repo
# but it lets us host two images, mostly the same, on Hub

FROM ruby:2.4

LABEL maintainer="Debezium Community"

COPY docker-entrypoint.sh /usr/local/bin/

ENV SITE_HOME=/site \
    CACHE_HOME=/cache \
    NODE_PATH=/usr/local/share/.config/yarn/global/node_modules

# Install jekyll with bundler 
ADD Gemfile .
RUN bundle update
RUN bundle install

# Install Node.js - Required by Antora
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt-get install -y nodejs

# Install Yarn
RUN npm install -g yarn

# install both bundler 1.x and 2.x
RUN gem install bundler -v "~>1.0" && gem install bundler jekyll

# Install Antora framework
RUN yarn global add @antora/cli@2.3.4 @antora/site-generator-default@2.3.4 \
    && rm -rf $(yarn cache dir)/* \
    && find $(yarn global dir)/node_modules/asciidoctor.js/dist/* -maxdepth 0 -not -name node -exec rm -rf {} \; \
    && find $(yarn global dir)/node_modules/handlebars/dist/* -maxdepth 0 -not -name cjs -exec rm -rf {} \; \
    && find $(yarn global dir)/node_modules/handlebars/lib/* -maxdepth 0 -not -name index.js -exec rm -rf {} \; \
    && find $(yarn global dir)/node_modules/isomorphic-git/dist/* -maxdepth 0 -not -name for-node -exec rm -rf {} \; \
    && rm -rf $(yarn global dir)/node_modules/moment/min \
    && rm -rf $(yarn global dir)/node_modules/moment/src \
    && apt-get install -y jq \
    && rm -rf /tmp/*

RUN apt-get install git

WORKDIR $SITE_HOME
VOLUME [ $SITE_HOME ]

# Install Rake and Bundler. This is the minimum needed to generate the site ...
RUN gem install rdoc -v 6.2.0
RUN gem install rake bundler

EXPOSE 4242

ENTRYPOINT [ "docker-entrypoint.sh" ]

# And execute 'run' by default ...
CMD [ "bundle", "exec", "jekyll", "serve", "--force_polling", "-H", "0.0.0.0", "-P", "4242" ]