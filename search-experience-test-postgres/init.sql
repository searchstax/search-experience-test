CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL,
    requestURL TEXT NOT NULL,
	status INTEGER NOT NULL,
    test_data TEXT,
    score TEXT
   );

CREATE TABLE IF NOT EXISTS lighthouse (
    id UUID PRIMARY KEY,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL,
    requestURL TEXT NOT NULL,
    status INTEGER NOT NULL,
    lighthouse_data TEXT,
    score TEXT
   );

CREATE TABLE IF NOT EXISTS crawls (
    id UUID PRIMARY KEY,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL,
    requestURL TEXT NOT NULL,
    status INTEGER NOT NULL,
    crawl_data TEXT,
    score TEXT
);