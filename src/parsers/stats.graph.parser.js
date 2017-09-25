var excludes = [
	'(webpack)',
	'back.png',
	'css-loader',
	'style'
];
function exFn(name) {
	var ex = false;
	excludes.forEach(key => {
		if (ex || name.indexOf(key) !== -1)
			ex = true;
	});
	return ex;
};

export const parse = (app) => {
  var maxTimestamp = 0;
  var maxSize = 0;
  var nodes = [];
  var edges = [];
  app.stats.modules.forEach(function(module, idx) {
    
    // var color = percentageToColor(Math.pow((module.size+1) / (maxSize+1), 1/4));
    var done = {};
    var uniqueReasons = module.reasons.filter(function(reason) {
      var parent = reason.module;
      if(done["$"+parent]) return false;
      done["$"+parent] = true;
      return true;
    });
    if (module.name.indexOf('./node_modules') !== -1 && module.name.indexOf('./node_modules/redshift') === -1)
      return;
    if (exFn(module.name))
      return;
    var uid = module.uid;
    var mass = module.name.split('/');
    // var edgeColor = typeof module.timestamp === "number" ? percentageToColor2(module.timestamp / maxTimestamp) : undefined;
    var ed = 0;
    uniqueReasons.forEach(function(reason) {
      var parentIdent = reason.moduleIdentifier;
      var parentModule = app.mapModulesIdent["$"+parentIdent];
      if(!parentModule) return;
      var weight = 1 / uniqueReasons.length / uniqueReasons.length;
      var async = !module.chunks.some(function(chunk) {
        return (function isInChunks(chunks, checked) {
          if(chunks.length === 0) return false;
          if(chunks.indexOf(chunk) >= 0) return true;
          chunks = chunks.filter(function(c) {
            return checked.indexOf(c) < 0;
          });
          if(chunks.length === 0) return false;
          return chunks.some(function(c) {
            return isInChunks(app.mapChunks[c].parents, checked.concat(c));
          });
        }(parentModule.chunks, []));
      });
      if (module.name.indexOf('./node_modules') !== -1 && module.name.indexOf('./node_modules/redshift') === -1)
        return;
      if (parentModule.name.indexOf('./node_modules') !== -1 && parentModule.name.indexOf('./node_modules/redshift') === -1)
        return;
      if (exFn(module.name))
        return;
      if (exFn(parentModule.name))
        return;
      ed += 1;
      edges.push({
        id: "edge" + module.uid + "-" + + parentModule.uid,
        sourceModuleUid: parentModule.uid,
        sourceModule: parentModule,
        source: "module" + parentModule.uid,
        targetModule: module,
        targetModuleUid: module.uid,
        target: "module" + module.uid,
        arrow: "target",
        type: async ? "dashedArrow" : "arrow",
        attributes: {
          lineDash: module.chunks.length === 0 ? [2] : [5],
          mbcolor: module.timestamp ? module.timestamp / maxTimestamp : 0,
          // originalColor: edgeColor,
          // color: edgeColor,
          size: weight,
          weight: async ? weight / 4 : weight
        }
      });
    });
  
    nodes.push({
      id: "module" + uid,
      uid: uid,
      moduleUid: uid,
      moduleId: module.id,
      module: module,
      type: "webpack",
      size: module.size + 1,
      label: mass[mass.length - 1],
      x: Math.random() * 10 - 10,
      y: Math.random() * 10 - 10,
      attributes: {
        mbcolor: Math.pow((module.size+1) / (maxSize+1), 1/4)
      }
      // x: Math.cos(idx / moduleCount * Math.PI * 2) * Math.sqrt(uniqueReasons.length + 1) * Math.sqrt(moduleCount),
      // y: Math.sin(idx / moduleCount * Math.PI * 2) * Math.sqrt(uniqueReasons.length + 1) * Math.sqrt(moduleCount),
      // originalColor: color,
      // color: color
    });
  });
  return {
    nodes,
    edges
  };
};