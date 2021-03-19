var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

   // check due date
   auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//jQuery delegated event listener
//alternative to an if(event.target.matches()){} inside the listener function
//here it checks for clicks on <p> elements in .list-group
$(".list-group").on("click", "p", function() {
  //you can chain multiple jQuery and js methods 

  //get the inner textext content of the current element, represented by $(this)
  //.trim() removes the white spaces before and after
  var text = $(this).text().trim();
  //create a text input element of the class .form-control, then give it the value of the text variable defined above
  var textInput = $("<textarea>").addClass("form-control").val(text);
  //replace the p element containing our text with the input element, also containing our text
  $(this).replaceWith(textInput);
  //highlights element
  textInput.trigger("focus");
});

//edit field was unfocused
$(".list-group").on("blur", "textarea", function() {
  // get the textarea's current value/text
  var text = $(this).val().trim();

  // get the parent ul's id attribute
  //.replace("list-", "") removes the 'list-' part of our category name eg. list-toDo -> toDo
  var status = $(this).closest(".list-group")
                .attr("id")
                .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this).closest(".list-group-item").index();
  //returns array at status eg toDo, which is also an array so we select the item at the [index] position returns the text property.
  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>").addClass("m-1").text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
              .text()
              .trim();

  // create new input element
  //<text class = "form-control">date</text>
  var dateInput = $("<input>")
                  .attr("type", "text")
                  .addClass("form-control")
                  .val(date);

  // swap out elements(replace textbox with text input)
  $(this).replaceWith(dateInput);

  // enable jquery ui date picker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {

      // when calendar is closed, force a "change" event
      //make it trigger 'change' upon closing because we got rid of the click listener
      //when we replaced the text input with a datepicker
      //this allows $(".list-group").on("change", "input[type='text']", function() to trigger upon clicking away from the datepicker 
      $(this).trigger("change");
    }
  });

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
// aka there is a difference between the span's value and the input's value
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
  auditTask($(taskSpan).closest(".list-group-item"));

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});




// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

$(".card .list-group").sortable({
  //define the elements our .card can attach to, other .card in case of an existant list, .list-group in case it's empty
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  //creates a clone to drag instead of the original, to prevent any unwanted clicks and events
  helper: "clone",
  //the below are additional listeners
  //triggers when beginning drag
  activate: function(event){
    console.log("activate", this);
  },
  //triggers when mouse is let go, ending drag
  deactivate: function(event){
    console.log("deactivate", this);
  },
  //triggers when dragging something into an element
  over: function (event){
    console.log("over"), event.target;
  },
  //triggers when contents of a list have been changed
  update: function(event){
    // temp array to store the task data that was just dragged and dropped
    var tempArr = [];
    // loop over current set of children in sortable list
  $(this).children().each(function() {
    var text = $(this)
      .find("p")
      .text()
      .trim();

    var date = $(this)
      .find("span")
      .text()
      .trim();

    //add task data to the temp array as an object
    tempArr.push({
      text: text,
      date: date
    });

    console.log(tempArr);
    // trim down the ul's ID to match object property
    console.log(this);
    var arrName = $(this).parent()
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  });
}
});
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    //removes element from the DOM entirely
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
})

$("#modalDueDate").datepicker({
  minDate: 1,
});

var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();
  // to ensure element is getting to the function
  
  // convert to moment object at 5:00pm
  //date, "L" = local date, defaults to 12am
  //.set("hour, 17") sets the time to 5pm, because its 17 hours from 12am
  var time = moment(date, "L").set("hour", 17);
 
  // remove any old classes from element
  //.list-group-item-danger is the Bootstrap class for all tasks near/over due date
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  
  // apply new Bootstrap class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days"))<=2){
    $(taskEl).addClass("list-group-item-warning");
  }
  
};

// load tasks for the first time
loadTasks();


