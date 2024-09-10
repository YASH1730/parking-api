/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("booking", (table) => {
        table.increments("id").primary(),
        table.string("parking_id").defaultTo(null),
        table.string("email").defaultTo(null),
        table.string("name").defaultTo(null),
        table.string("booking_slot").defaultTo(null),
        table.string("status").defaultTo('Booked'), // Booked and Released
        table
          .dateTime("created_at")
          .notNullable()
          .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table
        .dateTime("updated_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.dropTable("users");
  };
  