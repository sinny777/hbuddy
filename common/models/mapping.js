'use strict';

module.exports = function(Mapping) {

  Mapping.observe('before save', function updateTimestamp(ctx, next) {
		console.log('\n\nInside Mapping.js before save: ');
		  if (ctx.instance) {
			  if(!ctx.instance.audit){
				  ctx.instance.audit = {};
			  }
			  if(!ctx.instance.id){
				  ctx.instance.audit.created = new Date();
			  }
		    ctx.instance.audit.modified = new Date();
		  } else {
			  if(!ctx.data.audit){
				  ctx.data.audit = {};
			  }
			  ctx.data.audit.modified = new Date();
		  }
		 return next();
		});

};
