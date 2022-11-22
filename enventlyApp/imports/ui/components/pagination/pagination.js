import './pagination.html';
import { ReactiveDict } from 'meteor/reactive-dict';

Template.paginationTemplate.onCreated(function () {
    this.numOfPages = new ReactiveVar(0);
// console.log(":: this ---- > ",this);
    this.autorun(()=>{

        let length = Math.ceil( this.data.totalRecords.get()/this.data.recordPerPage.get() );
        this.numOfPages.set(length);

// console.log(":::: totalRecords - ",this.data.totalRecords.get(), typeof this.data.totalRecords.get());
// console.log(":::: recordPerPage - ",this.data.recordPerPage.get(), typeof this.data.recordPerPage.get());
// console.log(":: length value - ",length, typeof length);
    })
    
});

Template.paginationTemplate.onRendered(function () {

});

Template.paginationTemplate.helpers({

    numOfPages: function () {
        // console.log("Dict instance = >helpers ",this)
        let instance = Template.instance();

        let length = instance.numOfPages.get();

        let currentPage = instance.data.currentPage.get();
// console.log(":::: currentPage - ",currentPage);
        let showPages = [];

        //Our currentPage's value can be 1-length &&& actual length can be 0-(length-1)
        _.range(length).forEach((page)=>{
// console.log(":: ForEach - ",page);
            let pageNo = page+1;
            if(pageNo==currentPage) {
                if(length==1){
                    showPages.push(1);
                }
                else if(length==2) {
                    showPages.push(1, 2);
                }
                else if(length==3) {
                    showPages.push(1, 2, 3);
                }
                else if(length==4) {
                    showPages.push(1, 2, 3, 4);
                }
                else if(currentPage==1 && length>4) {
                    showPages.push(1,2,3,"...",length); 
                }
                else if(currentPage==2 && length>4) {
                    showPages.push(2,3,4,"...",length); 
                }
                else if(currentPage==3 && length>4) {
                    showPages.push(1,2,3,4,"...",length); 
                }
                else if(currentPage==length && length>4) {
                    showPages.push(1,2,"...",length-1,length); 
                }
                else if((currentPage+1)==length) {
                    showPages.push(1,2,"...",length-2,length-1,length); 
                }
                else if((currentPage+2)==length) {
                    showPages.push(1,2,"...",length-3,length-2,length-1,length); 
                }
                else {
                    showPages.push(1,"...",currentPage-1,currentPage,currentPage+1,"...",length); 
                }  
            }
        });
// console.log(":: show pages = ",showPages);
        return showPages;
    },

    pageNo: function(n) {
        //if user clicks on ... then we have to prevent increment in page number
        return (n!="...") ? n+1 : "..." ;
    },

    currentPage: function(){
        let instance = Template.instance();  
        let currentPage = instance.data.currentPage.get();
// console.log(":: currentPage Inside helper = ",currentPage);
        return currentPage;
    },

    isPageActive: function(page, selectedPage){
// console.log(":: isPageActive page ==== ", page);
// console.log(":: isPageActive selectedPage ==== ", selectedPage);

        let instance = Template.instance(); 
        if (page==selectedPage) {
            return "active";
        } else {
            return "waves-effect";
        }
    }
});

Template.paginationTemplate.events({
    'click a.page-num': (event, instance) => {
        event.preventDefault();

        if(event.currentTarget.innerText!="..."){
            let pageNum = parseInt(event.currentTarget.innerText);
            instance.data.currentPage.set(pageNum); 
        }
    },

    'click a.increase-page': (event, instance) => {
        event.preventDefault();
        let currentPage = instance.data.currentPage.get();
        let numOfPages = instance.numOfPages.get();

        if(currentPage<numOfPages){
            instance.data.currentPage.set(currentPage+1);
        }
    },

    'click a.decrease-page': (event, instance) => {
        event.preventDefault();
        let currentPage = instance.data.currentPage.get();

        if(currentPage>1){
            instance.data.currentPage.set(currentPage-1);
        }
    },
});
