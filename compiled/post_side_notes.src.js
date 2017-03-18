class Post_Side_Notes {

	static init(){
		this.PLUGIN_ID = "pd_post_side_notes";
		this.PLUGIN_KEY = "pd_post_side_notes";
		this.MAX_KEY_SPACE = parseInt(pb.data("plugin_max_key_length"), 10);

		this.images = {};

		this._textarea = document.createElement("textarea");

		this.setup();

		Post_Side_Notes_Posts.init();
		Post_Side_Notes_Tab.init();
	}

	static setup(){
		let plugin = pb.plugin.get(this.PLUGIN_ID);

		if(plugin && plugin.settings){
			let plugin_settings = plugin.settings;

			this.images = plugin.images;
		}
	}

	static html_encode(str = "", decode_first = false){
		str = (decode_first)? this.html_decode(str) : str;

		return $("<div />").text(str).html();
	}

	static html_decode(str = ""){
		this._textarea.innerHTML = str;

		let val = this._textarea.value;

		this._textarea.innerHTML = "";

		return val;
	}

}

class Post_Side_Notes_Posts {

	static init(){
		let thread_location_check = (

			pb.data("route").name == "search_results" ||
			pb.data("route").name == "thread" ||
			pb.data("route").name == "list_posts" ||
			pb.data("route").name == "permalink" ||
			pb.data("route").name == "all_recent_posts" ||
			pb.data("route").name == "recent_posts" ||
			pb.data("route").name == "posts_by_ip"

		);

		if(thread_location_check){
			$(this.ready.bind(this));
		}
	}

	static ready(){
		console.log(2);
	}

}

class Post_Side_Notes_Tab {

	static init(){
		let posting_location_check = (

			pb.data("route").name == "quote_posts" ||
			pb.data("route").name == "new_post" ||
			pb.data("route").name == "new_thread" ||
			pb.data("route").name == "edit_post" ||
			pb.data("route").name == "edit_thread"

		);

		if(posting_location_check){
			this.key = pb.plugin.key(Post_Side_Notes.PLUGIN_KEY);

			$(this.ready.bind(this));
		}
	}

	static ready(){
		new Post_Side_Posts_BBC_Tab({

			title: "Notes",
			content: this.build_tab(),
			id: "post-side-notes-bbc-tab",
			css: {}

		});

		this.bind_remove_event();
		this.bind_key_events();
		this.bind_submit();
	}

	static build_tab(){
		let post = pb.data("page").post;
		let post_id = (post && post.id)? parseInt(post.id, 10) : null;
		let current_notes = this.fetch_notes(post_id);
		let space_left = Post_Side_Notes.MAX_KEY_SPACE - JSON.stringify(current_notes).length;
		let html = "<div class='bbc-notes-header'><img id='notes-space-left-img' src='" + Post_Side_Notes.images.warning + "' title='If you go over the max space allowed, your notes will be lost.' /> <strong>Space Left:</strong> <div id='notes-space-left'>" + space_left + "</div></div>";

		html += "<div class='bbc-note-box-wrapper'>";

		if(current_notes.length){
			for(let n = 0, l = current_notes.length; n < l; ++ n){
				html += this.create_note_box(current_notes[n]);
			}
		}

		if(space_left){
			html += this.create_note_box();
		}

		html += "</div>";

		return $(html);
	}

	static bind_remove_event($elem = null){
		let $img = ($elem)? $elem.find("img") : $(".bbc-note-box img");

		$img.on("click", function(){
			let $parent = $(this).parent();
			let $wrapper = $parent.parent();

			$parent.remove();

			Post_Side_Notes_Tab.update_space();

			if($wrapper.find(".bbc-note-box").length == 0){
				let $box = $(Post_Side_Notes_Tab.create_note_box());

				Post_Side_Notes_Tab.bind_remove_event($box);
				Post_Side_Notes_Tab.bind_key_events($box);

				$wrapper.append($box);
			}
		});
	}

	static bind_key_events($box = null){
		let $textareas = ($box)? $box.find("textarea") : $(".bbc-note-box textarea");

		$textareas.on("keydown keyup", this.update_space);
	}

	static create_note_box(content = ""){
		let html = "";

		html += "<span class='bbc-note-box'><textarea>" + Post_Side_Notes.html_encode(content) + "</textarea><img src='" + Post_Side_Notes.images.remove + "' /></span>";

		return html;
	}

	static fetch_notes(post_id){
		if(!post_id){
			return [];
		}

		let data = pb.plugin.key(Post_Side_Notes.PLUGIN_KEY).get(post_id);

		if(data && Array.isArray(data)){
			return data;
		}

		return [];
	}

	static update_space(){
		let $boxes = $(".bbc-note-box textarea");
		let contents = [];

		$boxes.each(function(){
			contents.push($(this).val());
		});

		if(contents.length > 0 && contents[contents.length - 1].length){
			let $box = $(Post_Side_Notes_Tab.create_note_box());

			Post_Side_Notes_Tab.bind_remove_event($box);
			Post_Side_Notes_Tab.bind_key_events($box);

			$(".bbc-note-box-wrapper").append($box);
		}

		let used = JSON.stringify(contents).length;
		let left = Post_Side_Notes.MAX_KEY_SPACE - used;

		let $counter = $("#notes-space-left");

		if(left < 0){
			$counter.addClass("notes-space-left-warn");
			$("#notes-space-left-img").addClass("notes-space-left-warn");

		} else {
			$counter.removeClass("notes-space-left-warn");
			$("#notes-space-left-img").removeClass("notes-space-left-warn");
		}

		$counter.html(left);
	}

	static bind_submit(){
		let $form = $("form.form_thread_new, form.form_post_new, form.form_post_edit, form.form_thread_edit");

		if($form.length > 0){
			let klass = $form.attr("class");
			let hook = klass.split("form_")[1];

			if(hook){
				$form.on("submit", this.set_on.bind(this, hook));
			}
		}
	}

	static fetch_contents(){
		let $boxes = $(".bbc-note-box textarea");
		let contents = [];

		$boxes.each(function(){
			let val = $.trim($(this).val());

			if(val.length > 0){
				contents.push(val);
			}
		});

		return contents;
	}

	static over_space(){
		let contents = this.fetch_contents();
		let used = JSON.stringify(contents).length;
		let left = Post_Side_Notes.MAX_KEY_SPACE - used;

		if(left < 0){
			return true;
		} else {
			return false;
		}
	}

	static set_on(hook){
		let post = pb.data("page").post;
		let post_id = (post && post.id)? parseInt(post.id, 10) : null;
		let contents = this.fetch_contents();

		this.key.set_on(hook, post_id, contents);
	}

}

class Post_Side_Posts_BBC_Tab {

	constructor({title = "My Tab", content = "", id = "", css = null, events = {}} = {}){
		id = id || + new Date();

		let $wysiwyg_tabs = $(".editor ul.wysiwyg-tabs");
		let $tab = $("<li id='menu-item-" + id + "'><a href='#'>" + title + "</a></li>");
		let $tab_content = $("<div id='" + id + "'></div>").append(content);

		$wysiwyg_tabs.append($tab);

		if(css && typeof css == "object"){
			$tab_content.css(css);
		}

		$tab_content.hide().insertBefore($wysiwyg_tabs);

		$wysiwyg_tabs.find("li").click(function(e){
			let $active = $(this);

			e.preventDefault();

			$active.parent().find("li").removeClass("ui-active");
			$active.addClass("ui-active");

			$active.parent().find("li").each(function(){
				let id = $(this).attr("id");

				if(id.match(/bbcode|visual/i)){
					$(".editor .ui-wysiwyg .editors").hide();
				} else {
					if($active.attr("id") == id){
						return;
					}

					let selector = "";

					if(id){
						selector = "#" + id.split("menu-item-")[1];
					}

					if($(selector).length){
						if(events && events.hide){
							if(events.context){
								events.hide.bind(events.context)($tab, $tab_content);
							} else {
								events.hide($tab, $tab_content);
							}
						}

						$(selector).hide();
					}
				}
			});

			let id = $active.attr("id");
			let selector = "";

			if(id){
				selector = "#" + id.split("menu-item-")[1];
			}

			if(id.match(/bbcode|visual/i)){
				$(".editor .ui-wysiwyg .editors").show();
			} else if($(selector).length){
				if(events && events.show){
					if(events.context){
						events.show.bind(events.context)($tab, $tab_content);
					} else {
						events.show($tab, $tab_content);
					}
				}

				$(selector).show();
			}
		});

		return $tab_content;
	}

}

Post_Side_Notes.init();