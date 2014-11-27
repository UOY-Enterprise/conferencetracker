google.load('visualization', '1.0', {packages:['table','map','timeline']});

var ConferenceTracker = ConferenceTracker || {};
ConferenceTracker.events = null;

ConferenceTracker.load = function(data) {
  ConferenceTracker.events = new google.visualization.DataTable();
  ConferenceTracker.events.addColumn('string', 'Title');
  ConferenceTracker.events.addColumn('string', 'Description');
  ConferenceTracker.events.addColumn('string', 'Location');
  ConferenceTracker.events.addColumn('date', 'Deadline');
  ConferenceTracker.events.addColumn('date', 'Notification');
  ConferenceTracker.events.addColumn('string','Website');

  var title, description, type, location, date, lat, lon, tooltip, website;

  for (var i=0;i<data.length;i++){
      description = data[i].description;
      title = data[i].title;
      location = data[i].location;
      deadline = new Date(data[i].deadline);
      notification = new Date(data[i].notification);
      website = data[i].url

      ConferenceTracker.events.addRow([
        title, description, location, deadline, notification, website
      ]);
  }
}

ConferenceTracker.drawTable = function(domElement, removeStyling) {
  removeStyling = typeof removeStyling !== 'undefined' ? removeStyling : false;
  
  var tableView = new google.visualization.DataView(ConferenceTracker.events);
  tableView.setColumns([
    {calc:linkify, type:'string', label:'Title'},
    1,2,
    {calc:statusify, type:'string', label:'Deadline'},
    {calc:dateify, type:'string', label:'Notification'}
  ]);
  function linkify(dataTable, rowNum){
    var title = dataTable.getValue(rowNum, 0);
    var website = dataTable.getValue(rowNum, 5);
    
    return website == null ? title : "\<a href=\"" + website + "\">" + title + "\</a>";
  }
  function statusify(dataTable, rowNum){
    var deadline = dataTable.getValue(rowNum, 3);
    var today = new Date();
    
    var date = '<span class="date">' + deadline.toLocaleDateString() + '</span>';
    
    if(Math.floor((deadline.getTime() - today.getTime())/(1000*60*60*24)) < 60 && Math.floor((deadline.getTime() - today.getTime())/(1000*60*60*24)) >0){
      return date + '<span class="label label-warning">Soon</span>';
    }
    else if(Math.floor((deadline.getTime() - today.getTime())/(1000*60*60*24)) < 0 ){
       return date + '<span class="label label-danger">Closed</span>';
    }
    else{
      return date + '</span><span class="label label-success">Open</span>';
    }
  }
  function dateify(dataTable, rowNum){
    return '<span class="date">' + dataTable.getValue(rowNum, 4).toLocaleDateString() + '</span>';
  }
  
  var table = new google.visualization.Table(domElement);
  var cssClassNames = null;
  
  if (removeStyling) {
    cssClassNames = {
      headerRow: ' ',
      tableRow: ' ',
      oddTableRow: ' ',
      headerCell: ' ',
      tableCell: ' ',
      rowNumberCell: ' '
    }
    
    var removeGoogleClassFromTable = function(){
      domElement.getElementsByTagName('table')[0].className = 'table';
    }
  
    google.visualization.events.addListener(table, 'ready', removeGoogleClassFromTable);
    google.visualization.events.addListener(table, 'sort', removeGoogleClassFromTable);
  }
  
  table.draw(tableView, { allowHtml: true, cssClassNames: cssClassNames });
  
  return table;
}

ConferenceTracker.drawMap = function(domElement) {
  var mapOptions = {showTip:true, useMapTypeControl:true, mapType:'normal', enableScrollWheel:true};

  var geoView = new google.visualization.DataView(ConferenceTracker.events);
  geoView.setColumns([2,{calc:tooltipify, type:'string', label:'Tooltip'}]);
  function tooltipify(dataTable, rowNum){
    var title = dataTable.getValue(rowNum, 0);
    var description = dataTable.getValue(rowNum, 1);
    var website = dataTable.getValue(rowNum, 5);
  
    return '<a href="'+website+'">'+title+'</a>: '+description;
  }


  var map = new google.visualization.Map(domElement);
  map.draw(geoView, mapOptions);
  return map;
}
  
ConferenceTracker.drawTimeline = function(domElement) {
  var chartView = new google.visualization.DataView(ConferenceTracker.events);
  chartView.setColumns([0,3,4]);
  
  var chart = new google.visualization.Timeline(domElement);
  
  var options = {
      timeline: { rowLabelStyle: {fontName: 'Ubuntu'},
                  barLabelStyle: {fontName: 'Ubuntu'} }
    };
  chart.draw(chartView, options);
  return chart;
}

ConferenceTracker.link = function() {
  for (var i=0;i<arguments.length;i++){
    for (var j=0;j<arguments.length;j++){
      if (i != j) {
        var source = arguments[i];
        var target = arguments[j];
        
        // NB: We have to build the callback using a closure in order to 
        // fix the source and target variables inside the callback.
        var callback = function(s, t) {
            return function() { t.setSelection(s.getSelection()); };
        }(source, target);
        
        google.visualization.events.addListener(source, 'select', callback);
      }
    }
  }
}