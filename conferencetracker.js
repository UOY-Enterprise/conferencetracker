google.load('visualization', '1.0', {packages:['table','map','timeline']});

var ConferenceTracker = ConferenceTracker || {};
ConferenceTracker.data = null;

ConferenceTracker.load = function(dataRows) {
  ConferenceTracker.data = new google.visualization.DataTable();
  
  //Setup table
  var data = ConferenceTracker.data;
  data.addColumn('string', 'Title');
  data.addColumn('string', 'Description');
  data.addColumn('string', 'Type');
  data.addColumn('string', 'Location');
  data.addColumn('date', 'Deadline');
  data.addColumn('date', 'Notification');
  data.addColumn('string','Website');

  var title, description, type, location, date, lat, lon, tooltip, website;


  for (var i=0;i<dataRows.length;i++){
      description = dataRows[i].description;
      title = dataRows[i].title;
      type = dataRows[i].type;
      location = dataRows[i].location;
      deadline = new Date(dataRows[i].deadline);
      notification = new Date(dataRows[i].notification);
      website = dataRows[i].url

      data.addRows([
           [title, description, type, location, deadline, notification, website]
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