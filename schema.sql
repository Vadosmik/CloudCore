CREATE TABLE connections (
	id SERIAL NOT NULL, 
	provider VARCHAR(20) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	credentials VARCHAR NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE dashboards (
	id SERIAL NOT NULL, 
	title VARCHAR(100) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE charts (
	id SERIAL NOT NULL, 
	dashboard_id INTEGER NOT NULL, 
	title VARCHAR(100) NOT NULL, 
	chart_type VARCHAR(30) NOT NULL, 
	time_range VARCHAR(20) NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(dashboard_id) REFERENCES dashboards (id) ON DELETE CASCADE
);

CREATE TABLE resources (
	id SERIAL NOT NULL, 
	connection_id INTEGER NOT NULL, 
	external_id VARCHAR(255) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	resource_type VARCHAR(50) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(connection_id) REFERENCES connections (id) ON DELETE CASCADE
);

CREATE TABLE metric_definitions (
	id SERIAL NOT NULL, 
	resource_id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	unit VARCHAR(20) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(resource_id) REFERENCES resources (id) ON DELETE CASCADE
);

CREATE TABLE chart_metrics (
	chart_id INTEGER NOT NULL, 
	metric_definition_id INTEGER NOT NULL, 
	PRIMARY KEY (chart_id, metric_definition_id), 
	FOREIGN KEY(chart_id) REFERENCES charts (id) ON DELETE CASCADE, 
	FOREIGN KEY(metric_definition_id) REFERENCES metric_definitions (id) ON DELETE CASCADE
);

CREATE TABLE metric_data_points (
	id SERIAL NOT NULL, 
	metric_definition_id INTEGER NOT NULL, 
	value FLOAT NOT NULL, 
	timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(metric_definition_id) REFERENCES metric_definitions (id) ON DELETE CASCADE
);
