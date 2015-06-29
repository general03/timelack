require.config({
  baseUrl : "node_modules",
  paths: {
    "babel-core": "babel-core/browser-polyfill.min",
    //"polyfill": "babel-es6-polyfill/browser-polyfill"
    "reactjs": "react/dist/react.min",
    "JSX": "react/dist/JSXTransformer"
  }
});
//import React from 'react/dist/react.min';
//var React = require('react/dist/react.min');
require(['babel-core'], function(babel){

  // URL for tasks, API RESTful
  var urlTask = "http://127.0.0.1:9000/task";
  var urlCat = "http://127.0.0.1:9000/category";

  var NewTask = React.createClass({

    getInitialState () {
      return {
        tasks: this.props.items,
            // Update the value in the state (ES6)
            category: Object.assign({}, this.props.items[0], {selectedIndex: 0}), 
            task: [{}]
          }
        },
        handleSubmit (event) {
          event.preventDefault();

          var _this = this;
          var idTask = this.state.task.id;
          var item = {owner: "david", name: this.state.task.name, categories: [this.state.category.name]};

          fetch(`${urlTask}/`, {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
          })
          .then(function(response) {
            return response.json()
          })
          .then(function(body) {
            console.log(body);

            alert("Saving success");

              // Add task to the list
              item.id = body.id;
              var result = _this.state.tasks[_this.state.category.selectedIndex].tasks.concat(item);
              _this.state.tasks[_this.state.category.selectedIndex].tasks = result;

              _this.props.onAddTaskToList(_this.state.tasks);

              // Empty the input field
              React.findDOMNode(_this.refs.newTaskInForm.refs.inputTask).value = ""; 
            })
          .catch(function(e){alert("Error saving!");console.log(e)});


        },

        onTaskChange (indexCat, taskName) {
          this.setState({ task: {name: taskName} });
        },
        onCategoryChange (idCategory, categoryName, selectedOption) {console.log(idCategory, categoryName, selectedOption)
          this.setState({ category: {id: idCategory, name: categoryName, selectedIndex: selectedOption} });
        },
        render () { 
          var emptyArray = [{}];

          return (
            <form onSubmit={this.handleSubmit} >

              <Task ref="newTaskInForm" items={emptyArray} onChange={this.onTaskChange} classStyle="newTask" />

              <Category items={this.state.tasks} onChange={this.onCategoryChange}/>

            </form>
            );
        }
      });


var Category = React.createClass({

  getInitialState () {
    return {categories: this.props.items};
  },

  onFormChange (event) {
    this.props.onChange(event.target.value, event.target.options[event.target.selectedIndex].text, event.target.selectedIndex);
  },

  render () {
    var categoryNodes = this.state.categories.map(function (category) {
      return(
        <option value={category.id}>{category.name}</option>
        )
    });

    return (
      <div>

      <label>Category : </label>

      <select onChange={this.onFormChange} >
      {categoryNodes}
      </select>

      </div>
      );
  }
});


var Task = React.createClass({

  getInitialState () {
    var taskContent = this.props.items;
    if(this.props.items == undefined)
      taskContent = [{}];
    return {tasks: taskContent};
  },

  onFormChange (i, event) {
    this.props.onChange(i, event.target.value);
  },

  render () {
    if(this.props.items.length > 0)
    {
      var taskNodes = this.props.items.map(function (task, i) {
        return(
         <input type="text" 
         ref="inputTask"
         defaultValue={task.name}
         value={task.name}
         onChange={this.onFormChange.bind(this, i)}
         placeholder="Custom task"
         className={this.props.classStyle} />
         )
      }.bind(this));

      return (
        <div>
        {taskNodes}
        </div>
        );
    }
    else
    {
      return(<h5>No task available</h5>);
    }
  }
});


var ListTask = React.createClass({

  getInitialState () {
    return {tasks: this.props.items};
  },


  onTaskChange (indexCat, category, indexTask, taskName) {
    var _this = this;
    var _indexCat = indexCat;
    var _indexTask = indexTask;

    this.state.tasks[indexCat].tasks[indexTask].name = taskName;

    var item = Object.assign({}, this.state.tasks[indexCat].tasks[indexTask], {owner: "david"});

    fetch(`${urlTask}/${item.id}/`, {
      method: "PUT",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(item)
    })
    .then(function(response) {
      return response.json()
    })  
    .then(function(body) {
      console.log(body);

      var allItems = Object.assign({}, _this.state.tasks[_indexCat].tasks[_indexTask], body);
      _this.setState({ tasks: _this.state.tasks});

      alert("Saving success");             
    })
    .catch(function(e){alert("Error saving!");console.log(e)});
  },

  render () {

    var tasksList = this.state.tasks.map(function (category, i) {

      return (
        <div>

        <h4>{category.name}</h4>

        <Task classStyle="listTask" items={category.tasks} onChange={this.onTaskChange.bind(this, i, category)}/>

        <hr/>

        </div>
        );
    }.bind(this));

    return(
      <div>
      {tasksList}
      </div>  
      );
  }
});

var TimeLack = React.createClass({

  getInitialState () {
    return {tasks: this.props.items};
  },

  onUpdateList (items) {

    this.setState({ tasks: items });

  },

  render () {

    return (
      <div>

        <fieldset>

          <legend>Add task :</legend>
          
          <NewTask items={this.state.tasks} onAddTaskToList={this.onUpdateList}/>
        
        </fieldset>

        <ListTask items={this.state.tasks} />

      </div>
      );

  }
});

fetch(`${urlCat}/?format=json`)
.then(function(response) {
  return response.json()
})
.then(function(body) {
  console.log(body);

  React.render(
    <TimeLack items={body}/>,
    document.getElementById('timelack')
    );
})
.catch(function(e){alert("error");console.log(e)});

});