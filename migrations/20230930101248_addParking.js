/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('parking',(t)=>{
    t.increments('id').primary(null),
    t.string('state').defaultTo(null),
    t.string('district').defaultTo(null),
    t.string('address').defaultTo(null),
    t.string('city').defaultTo(null),
    t.string('slot').defaultTo(null),
    t.string('location').defaultTo(null),
    t.string("user_id").defaultTo(null),
    t.timestamp('created_at')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('parking');
};
