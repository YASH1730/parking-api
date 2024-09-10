/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    knex.schema.alterTable('parking',(t)=>{
        t.dropColumn('own_loc')
      })
    return knex.schema.alterTable('request_queue',(t)=>{
      t.string("own_loc").defaultTo(null);
    })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable('request_queue',t=>{
        t.dropColumn('own_loc')
    });
  };
  