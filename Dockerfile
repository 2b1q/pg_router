FROM node

# Create app directory
WORKDIR /usr/app

# Install app dependencies
COPY package.json ./
RUN npm install --quiet

# Bundle app source
COPY . ./

#EXPOSE 3006

#CMD ["npm", "start"]
