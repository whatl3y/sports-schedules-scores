# Base image
FROM node:14.5.0

LABEL AUTHOR="Lance Whatley"

# specify working directory
WORKDIR /usr/sports

# Install dependencies
COPY package.json .

# why are we using --no-package-lock? see issue below
# https://stackoverflow.com/a/53437059/7857707
RUN npm install --no-package-lock

# Copy the remainder of the source code and build
COPY . .
RUN npm run postinstall

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

# Default command
CMD npm start
