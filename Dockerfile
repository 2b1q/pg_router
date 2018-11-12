FROM node

# Create app directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY . /app
RUN npm install

# Bundle app source
#COPY . ./

EXPOSE 3006

CMD ["npm", "start"]
