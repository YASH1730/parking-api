/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('vehicle_details',t=>{
    t.increments('id').primary(null),
    t.string("vehicle_type").defaultTo(null),
    t.string("vehicle_model").defaultTo(null),
    t.string("reg_no").defaultTo(null),
    t.string("owners_id").defaultTo(null)
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable("vehicle_details");
};
