# Use a imagem do Nginx como base
FROM nginx:latest

# Copie os arquivos do seu front-end para o diretório padrão do Nginx
COPY . /usr/share/nginx/html

# Exponha a porta 80 para acesso externo
EXPOSE 80

# Comando de inicialização do Nginx
CMD ["nginx", "-g", "daemon off;"]