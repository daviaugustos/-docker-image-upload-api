# Especifica a imagem base
FROM node:14

# Define o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copia os arquivos package.json e package-lock.json
COPY package*.json ./

# ... Restante do seu Dockerfile ...

# Copia o script wait-for-it.sh para o contêiner e torna-o executável
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# ... Restante do seu Dockerfile ...


# Instala as dependências do projeto
RUN npm install

# Copia os arquivos da aplicação para o diretório de trabalho
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Define o comando para iniciar a aplicação
CMD ["node", "index.js"]
