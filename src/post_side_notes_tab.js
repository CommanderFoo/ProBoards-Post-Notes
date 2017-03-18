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