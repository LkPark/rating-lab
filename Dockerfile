FROM postgres:alpine

ENV POSTGRES_DB rating_lab_cms
ENV POSTGRES_USER admin
ENV POSTGRES_PASSWORD password

COPY ./rating-lab-cms/postgresql/initdb /docker-entrypoint-initdb.d
COPY ./rating-lab-cms/postgresql/seeds /seeds
