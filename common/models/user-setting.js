module.exports = function(Usersetting) {
  Usersetting.observe('before save', function updateAudit(ctx, next) {
      var settings = {};
      if (ctx.instance) {
        settings = ctx.instance;
        if(!settings.audit){
          settings.audit = {};
        }
        if(!settings.id){
          settings.audit.created = new Date();
        }
        settings.audit.modified = new Date();
      } else {
        settings = ctx.data;
        if(!settings.audit){
          settings.audit = {};
        }
        settings.audit.modified = new Date();
      }
     return next();
  });
};
