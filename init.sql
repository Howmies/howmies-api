CREATE TABLE IF NOT EXISTS users
(
    first_name character varying(24) COLLATE pg_catalog."default" NOT NULL,
    email character varying(60) COLLATE pg_catalog."default" NOT NULL,
    phone character varying(16) COLLATE pg_catalog."default" NOT NULL,
    register_date character varying(32) COLLATE pg_catalog."default" NOT NULL,
    other_details text COLLATE pg_catalog."default",
    password character varying(1024) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(24) COLLATE pg_catalog."default" NOT NULL,
    user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT clients_client_email_key UNIQUE (email),
    CONSTRAINT clients_client_phone_number_key UNIQUE (phone)
)