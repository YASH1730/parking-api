/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('parking_request',t=>{
      t.increments('id').primary(null),
      t.string("user_name").defaultTo(null),
      t.string("user_email").defaultTo(null),
      t.string("phone_no").defaultTo(null),
      t.string("parking_id").defaultTo(null),
      t.string("vehicle_no").defaultTo(null),
      t.string("location").defaultTo(null),
      t.string("user_id").defaultTo(null),
      t.timestamp('created_at')
    })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable("parking_request")
  };
  