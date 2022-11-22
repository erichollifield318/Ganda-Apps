

UI.registerHelper('formatTime', function(context, options) {
  if(context){
    const moment = require('moment');
    return moment(context).format('DD/MM/YYYY, hh:mm');
  }
  else return '00/00/0000, 00:00';
})

UI.registerHelper('formatStatus', function(context, options) {
  if(parseInt(context))
    return 'Published';
  else return 'Unpublished';
})

UI.registerHelper('findAlertBox', function(context, options) {
  return '<div class="form-group" id="msg"></div>';
})

UI.registerHelper('prevPage', function(page) {
   let currentPage = parseInt(FlowRouter.getParam('page')) || 1;
   let previousPage = currentPage === 1 ? 1 : currentPage - 1;
   Template.instance().skipCount.set((currentPage - 1) * Template.instance().recordPerPage.get());
   return FlowRouter.path('/'+getRouterPath(page)+'/:page', {page:previousPage},'');
})


UI.registerHelper('nextPage', function(page, collection, search_field) {
   let currentPage = parseInt(FlowRouter.getParam('page')) || 1;
    Template.instance().skipCount.set((currentPage - 1) * Template.instance().recordPerPage.get());
    let search=Template.instance().search.get();
      let search_cond={};
      if(search){
         search_cond[search_field]=eval(`/${search}/i`);
      }
    let count=collection.find(search_cond).count();
    let nextPage='';
    if(parseInt(currentPage)*parseInt(Template.instance().recordPerPage.get()) < count){
         nextPage = parseInt(currentPage) + 1;
    }else {
      nextPage = currentPage;
    }
    return FlowRouter.path('/'+getRouterPath(page)+'/:page', {page:nextPage},'');
})

UI.registerHelper('showPageNo', function(page, collection, search_field) {
   let currentPage = parseInt(FlowRouter.getParam('page')) || 1;
   let search=Template.instance().search.get();
    let search_cond={};
    if(search){
       search_cond[search_field]=eval(`/${search}/i`);
    }
   let count=collection.find(search_cond).count();
   let record_per_page=Template.instance().recordPerPage.get()
   let total_no_page=(parseInt(count) / record_per_page);
   total_no_page=Math.ceil(total_no_page);
   let pageHtml='';
   for(let i=1; i <= total_no_page; i++){
      if(i == currentPage){
        pageHtml +='<li><a class="pageActive" href="'+FlowRouter.path('/'+getRouterPath(page)+'/:page', {page:i},'')+'">'+i+'</a></li>'
      } else {
        pageHtml +='<li><a  href="'+FlowRouter.path('/'+getRouterPath(page)+'/:page', {page:i},'')+'">'+i+'</a></li>'
      } 
   }
   return pageHtml;
})



UI.registerHelper('getRouterPath', function(path) {
  return FlowRouter.path(path);
})

export const getRouterPath=function getRouterPath(path){
  return FlowRouter.path(path);

}

export const record_per_page=function record_page(){
  let record_per_page=20;
  console.log("record_per_page",record_per_page)
  return record_per_page;

}
 
export const left_menu=function hide_show_left_menu(arg1, arg2){
	$(arg1).addClass("active").siblings().removeClass("active");
  $(arg2).addClass("active").siblings().removeClass("active");
}

export const tinymceEditior=function tinymceEditior(){
  tinymce.EditorManager.editors = []; 
  tinymce.init({
    selector: 'textarea.editme',
    // editor_selector : "content",
    height: 300,
    theme: 'modern',
    plugins: [
      'advlist autolink lists link image charmap print preview hr anchor pagebreak',
      'searchreplace wordcount visualblocks visualchars code fullscreen',
      'insertdatetime media nonbreaking save table contextmenu directionality',
      'emoticons template paste textcolor colorpicker textpattern imagetools'
    ],
    toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
    toolbar2: 'print preview media | forecolor backcolor emoticons',
    image_advtab: true,
    templates: [
      { title: 'Test template 1', content: 'Test 1' },
      { title: 'Test template 2', content: 'Test 2' }
    ],
    file_browser_callback : function(field_name, url, type, win) { 

                // from http://andylangton.co.uk/blog/development/get-viewport-size-width-and-height-javascript
                var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                y = w.innerHeight|| e.clientHeight|| g.clientHeight;

            var cmsURL = 'index.html?&field_name='+field_name+'&langCode='+tinymce.settings.language;

            if(type == 'image') {           
                cmsURL = cmsURL + "&type=images";
            }

            tinyMCE.activeEditor.windowManager.open({
                file : cmsURL,
                title : 'Filemanager',
                width : x * 0.8,
                height : y * 0.8,
                resizable : "yes",
                close_previous : "no"
            });         

        },
    skin_url: '/packages/teamon_tinymce/skins/lightgray',
  });
}