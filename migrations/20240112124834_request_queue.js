/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("request_queue", (table) => {
        table.increments("id").primary(),
        table.string("parking_id").defaultTo(null),
        table.string("lender_email").defaultTo(null),
        table.string("lender_name").defaultTo(null),
        table.string("status").defaultTo('Pending'), // Pending and Approved and Released
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
  