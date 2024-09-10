/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('parking', table => {
      table.dropColumn('booked_slot')
      table.dropColumn('slot')
      table.dropColumn('user_id')
    })
  };
  

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('parking', table => {
      table.dropColumn('booked_slot');
    })
  };


