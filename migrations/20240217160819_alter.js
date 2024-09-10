/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('parking',(t)=>{
      t.string("latitude").defaultTo(null);
      t.string("longitude").defaultTo(null);
    })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable('parking',t=>{
        t.dropColumn('latitude')
        t.dropColumn('longitude')
    });
  };
  