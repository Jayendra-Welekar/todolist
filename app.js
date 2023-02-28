//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash')
const PORT = process.env.PORT || 3030;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set('strictQuery', false);

mongoose.connect('mongodb+srv://admin-jay:Welekar2003@cluster0.kqit3ti.mongodb.net/todolistDB')

const itemSchema = {
  name: String
};

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Buy Food'
})

const item2 = new Item({
  name: 'Cook food'
})

const item3 = new Item({
  name: 'Eat Food'
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  list: [itemSchema]
}

const List = mongoose.model('List', listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully updated");
        }
      })
      res.redirect('/');
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })
});

app.post("/", function (req, res) {

  const itemName =   req.body.newItem;
  const listName = req.body.list;
  console.log(listName)

  const item = new Item({
    name: itemName
  })

  if(listName === 'Today'){
    item.save();
    res.redirect('/');
  } else{
    List.findOne({name: listName}, function(err, found){
      found.list.push(item);
      found.save();
      res.redirect("/"+listName)
    })
  }

  
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listTitle;

  if(listName === 'Today'){
    Item.findByIdAndDelete(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Deleted Successfully")
        res.redirect('/');
      }
    })
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {list: {_id: checkedItemId}}}, function(err, found){
      if(!err){
        res.redirect('/'+listName);
      }
    })
  }

  
})

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get('/:customListName', function (req, res) {
  const customListName = _.capitalize(req.params.customListName) ;

  List.findOne({ name: customListName }, function (err, found) {
    if (found) {
      res.render("list",  { listTitle: found.name, newListItems: found.list });
      
    } else {
      const list = new List({
        name: customListName,
        list: defaultItems
      })
      list.save();
      res.redirect("/"+customListName);
      console.log("New item added");
    }

  })

})

app.listen(PORT, function () {
  console.log("Server started on port 3000");
});
