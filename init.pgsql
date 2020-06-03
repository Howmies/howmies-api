CREATE SEQUENCE users_id_seq;
CREATE TABLE
IF NOT EXISTS users
(
    first_name character varying(24) COLLATE pg_catalog."default" NOT NULL,
    email character varying(60) COLLATE pg_catalog."default" NOT NULL,
    phone character varying(16) COLLATE pg_catalog."default",
    register_date character varying(32) COLLATE pg_catalog."default" NOT NULL,
    other_details text COLLATE pg_catalog."default",
    password character varying(1024) COLLATE pg_catalog."default",
    last_name character varying(24) COLLATE pg_catalog."default" NOT NULL,
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_phone_key UNIQUE (phone)
);

CREATE SEQUENCE properties_id_seq;
CREATE TABLE
IF NOT EXISTS properties
(
    property_id integer NOT NULL DEFAULT nextval('properties_id_seq'::regclass),
    address character varying(56) COLLATE pg_catalog."default" NOT NULL,
    lga character varying(16) COLLATE pg_catalog."default" NOT NULL,
    state character varying(16) COLLATE pg_catalog."default" NOT NULL,
    price integer NOT NULL,
    property_desc character varying(128) COLLATE pg_catalog."default",
    owner_id integer NOT NULL,
    post_date character varying(32) COLLATE pg_catalog."default" NOT NULL,
    property_phone character varying(16) COLLATE pg_catalog."default" NOT NULL,
    property_email character varying(64) COLLATE pg_catalog."default" NOT NULL,
    status_type integer NOT NULL,
    period integer NOT NULL,
    property_type integer NOT NULL,
    CONSTRAINT properties_pkey PRIMARY KEY (property_id),
    CONSTRAINT properties_users_id_fkey FOREIGN KEY (owner_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT property_type_fkey FOREIGN KEY (property_type)
        REFERENCES public.property_types (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT status_period_fkey FOREIGN KEY (period)
        REFERENCES public.status_periods (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT status_type_fkey FOREIGN KEY (status_type)
        REFERENCES public.status_types (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);

CREATE SEQUENCE images_id_seq;
CREATE TABLE
IF NOT EXISTS images
(
    id integer NOT NULL DEFAULT nextval('images_id_seq'::regclass),
    image_url text COLLATE pg_catalog."default" NOT NULL,
    property_id integer NOT NULL,
    CONSTRAINT images_pkey PRIMARY KEY (id),
    CONSTRAINT images_property_id_fkey FOREIGN KEY (property_id)
        REFERENCES public.properties (property_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE SEQUENCE property_types_id_seq;
CREATE TABLE
IF NOT EXISTS property_types
(
    id integer NOT NULL DEFAULT nextval('property_types_id_seq'::regclass),
    property_name character varying(16) COLLATE pg_catalog."default" NOT NULL,
    "desc" character varying(128) COLLATE pg_catalog."default",
    CONSTRAINT property_types_pkey PRIMARY KEY (id),
    CONSTRAINT property_types_property_name_key UNIQUE (property_name)
);

CREATE SEQUENCE status_periods_id_seq;
CREATE TABLE
IF NOT EXISTS status_periods
(
    id integer NOT NULL DEFAULT nextval('status_periods_id_seq'::regclass),
    period_name character varying(16) COLLATE pg_catalog."default" NOT NULL,
    "desc" text COLLATE pg_catalog."default",
    CONSTRAINT status_period_pkey PRIMARY KEY (id),
    CONSTRAINT status_periods_period_name_key UNIQUE (period_name)
);

CREATE SEQUENCE status_types_id_seq;
CREATE TABLE
IF NOT EXISTS status_types
(
    id integer NOT NULL DEFAULT nextval('status_types_id_seq'::regclass),
    status_name character varying(16) COLLATE pg_catalog."default",
    "desc" text COLLATE pg_catalog."default",
    CONSTRAINT status_type_pkey PRIMARY KEY (id),
    CONSTRAINT status_types_status_name_key UNIQUE (status_name)
);

CREATE SEQUENCE features_id_seq;
CREATE TABLE
IF NOT EXISTS features
(
    id integer NOT NULL DEFAULT nextval('features_id_seq'::regclass),
    feature_name character varying(32) COLLATE pg_catalog."default" NOT NULL,
    "desc" text COLLATE pg_catalog."default",
    CONSTRAINT features_pkey PRIMARY KEY (id),
    CONSTRAINT features_feature_name_key UNIQUE (feature_name)
);

CREATE SEQUENCE properties_features_id_seq;
CREATE TABLE
IF NOT EXISTS properties_features
(
    id integer NOT NULL DEFAULT nextval('properties_features_id_seq'::regclass),
    property_id integer NOT NULL,
    feature_id bigint NOT NULL DEFAULT nextval('properties_features'::regclass),
    CONSTRAINT properties_features_pkey PRIMARY KEY (id),
    CONSTRAINT features_feature_id_fkey FOREIGN KEY (feature_id)
        REFERENCES public.features (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT properties_features_property_id_fkey FOREIGN KEY (property_id)
        REFERENCES public.properties (property_id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
