CREATE TABLE IF NOT EXISTS users
(
    id integer NOT NULL DEFAULT nextval('"Clients_client_id_seq"'::regclass),
    first_name character varying(24) COLLATE pg_catalog."default" NOT NULL,
    email character varying(60) COLLATE pg_catalog."default" NOT NULL,
    phone character varying(16) COLLATE pg_catalog."default",
    register_date character varying(32) COLLATE pg_catalog."default" NOT NULL,
    other_details text COLLATE pg_catalog."default",
    password character varying(1024) COLLATE pg_catalog."default",
    last_name character varying(24) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT clients_pkey PRIMARY KEY (id),
    CONSTRAINT clients_client_email_key UNIQUE (email),
    CONSTRAINT clients_client_phone_number_key UNIQUE (phone)
)
