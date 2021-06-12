FROM mariadb:latest

ENV MYSQL_DATABASE nida_smart_energy
ENV MYSQL_USER admin
ENV MYSQL_PASSWORD nidasmartenergy
ENV MYSQL_ROOT_PASSWORD nidasmartenergy

RUN apt-get update && apt-get -y install vim

EXPOSE 3306

COPY . .

CMD ["mysqld"]