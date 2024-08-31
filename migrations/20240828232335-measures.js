'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('measures',{
    id: { type: 'int', primaryKey: true, autoIncrement: true},
    customer_code: 'string',
    measure_uuid: 'string',
    type: 'string',
    measure_value: 'decimal',
    image_url: 'string',
    has_confirmed: { type: 'boolean', defaultValue: false },
    datetime: 'datetime'
  })


};

exports.down = function(db) {
  return db.dropTable('measures');
};

exports._meta = {
  "version": 1
};
