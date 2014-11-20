google.load('visualization', '1.0', {packages:['table','map','timeline']});

var ConferenceTracker = ConferenceTracker || {};
ConferenceTracker.data = null;

ConferenceTracker.load = function(data) {
  ConferenceTracker.data = new google.visualization.DataTable();
  
  //Setup table
  ConferenceTracker.data.addColumn('string', 'Title');
  ConferenceTracker.data.addColumn('string', 'Description');
  ConferenceTracker.data.addColumn('string', 'Type');
  ConferenceTracker.data.addColumn('string', 'Location');
  ConferenceTracker.data.addColumn('date', 'Deadline');
  ConferenceTracker.data.addColumn('date', 'Notification');
  ConferenceTracker.data.addColumn('string','Website');

  var title, description, type, location, date, lat, lon, tooltip, website;

  for (var i=0;i<data.length;i++){
      description = data[i].description;
      title = data[i].title;
      type = data[i].type;
      location = data[i].location;
      deadline = new Date(data[i].deadline);
      notification = new Date(data[i].notification);
      website = data[i].url

      ConferenceTracker.data.addRow([
        title, description, type, location, deadline, notification, website
      ]); 
  }
}

ConferenceTracker.drawTable = function() {
  var tableOptions = {'showRowNumber': true, 'allowHtml': true/*, 'cssClassNames': cssClassNames*/ };
  tableOptions['page'] = 'enable';
  tableOptions['pageSize'] = 10;
  tableOptions['pagingSymbols'] = {prev: 'prev', next: 'next'};
  tableOptions['pagingButtonsConfiguration'] = 'auto';
  

  var tableView = new google.visualization.DataView(ConferenceTracker.data);
  tableView.setColumns([
    {calc:linkify, type:'string', label:'Title'},
    1,2,3,
    {calc:statusify, type:'string', label:'Deadline'},
    {calc:dateify, type:'string', label:'Notification'}
  ]);
  function linkify(dataTable, rowNum){
    var title = dataTable.getValue(rowNum, 0);
    var website = dataTable.getValue(rowNum, 6);
    
    return website == null ? title : "\<a href=\"" + website + "\">" + title + "\</a>";
  }
  function statusify(dataTable, rowNum){
    var deadline = dataTable.getValue(rowNum, 4);
    var today = new Date();
    
    if(Math.floor((deadline.getTime() - today.getTime())/(1000*60*60*24)) < 60 && Math.floor((deadline.getTime() - today.getTime())/(1000*60*60*24)) >0){
      return deadline.toLocaleDateString() + '<span class="label label-warning">Soon</span>';
    }
    else if(Math.floor((deadline.getTime() - today.getTime())/(1000*60*60*24)) < 0 ){
       return deadline.toLocaleDateString() + '<span class="label label-danger">Closed</span>';
    }
    else{
      return deadline.toLocaleDateString() + '<span class="label label-success">Open</span>';
    }
  }
  function dateify(dataTable, rowNum){
    return dataTable.getValue(rowNum, 5).toLocaleDateString();
  }
  
  var table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(tableView, tableOptions);
  return table;
}

ConferenceTracker.drawMap = function() {
  var mapOptions = {showTip:true, useMapTypeControl:true, mapType:'normal', enableScrollWheel:true};

  var geoView = new google.visualization.DataView(ConferenceTracker.data);
  geoView.setColumns([3,{calc:tooltipify, type:'string', label:'Tooltip'}]);
  function tooltipify(dataTable, rowNum){
    var title = dataTable.getValue(rowNum, 0);
    var description = dataTable.getValue(rowNum, 1);
    var website = dataTable.getValue(rowNum, 6);
  
    return '<a href="'+website+'">'+title+'</a>: '+description;
  }


  var map = new google.visualization.Map(document.getElementById('map_div'));
  map.draw(geoView, mapOptions);
  return map;
}
  
ConferenceTracker.drawTimeline = function() {
  var chartView = new google.visualization.DataView(ConferenceTracker.data);
  chartView.setColumns([0,4,5]);
  
  var chart = new google.visualization.Timeline(document.getElementById('timeline_div'));
  
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