class Post_Notes_Tab {

	static init(){
		let posting_location_check = (

			pb.data("route").name == "quote_posts" ||
			pb.data("route").name == "new_post" ||
			pb.data("route").name == "new_thread" ||
			pb.data("route").name == "edit_post" ||
			pb.data("route").name == "edit_thread"

		);

		if(posting_location_check){
			this.key = pb.plugin.key(Post_Notes.PLUGIN_KEY);

			$(this.ready.bind(this));
		}
	}

	static ready(){
		new Post_BBC_Tab({

			title: "Notes (0)",
			content: this.build_tab(),
			id: "post-notes-bbc-tab",
			css: {}

		});

		this.bind_remove_event();
		this.bind_key_events();
		this.bind_submit();

		this.update_tab_count();
	}

	static build_tab(){
		let post = pb.data("page").post;
		let post_id = (post && post.id)? parseInt(post.id, 10) : null;
		let notes_data = Post_Notes.fetch_notes(post_id);
		let current_notes = notes_data.n || [];
		let current_type = parseInt(notes_data.t, 10) || 1;
		let space_left = Post_Notes.MAX_KEY_SPACE - JSON.stringify(notes_data).length;
		let html = "<div class='bbc-notes-header'><div class='bbc-post-notes-info'><img id='notes-space-left-img' src='" + Post_Notes.images.warning + "' title='If you go over the max space allowed, your notes will be lost.' /> <strong>Space Left:</strong> <div id='notes-space-left'>" + space_left + "</div></div>";

		html += "<div class='bbc-post-notes-type-wrapper'>";

		html += this.create_additional_options(current_type);
		html += this.create_type_drop_down(current_type);

		html += "</div></div><div class='bbc-note-box-wrapper'>";

		if(current_notes.length > 0){
			for(let n = 0, l = current_notes.length; n < l; ++ n){
				html += this.create_note_box(current_notes[n], false);
			}
		}

		if(space_left){
			html += this.create_note_box("", false);
		}

		html += "</div>";

		let $html = $(html);

		this.bind_over_out($html);

		return $html;
	}

	static create_additional_options(selected = 1){
		let html = "";

		//html += "<input type='checkbox' value='11' id='bbc-post-notes-accordion' />";

		return html;
	}

	static create_type_drop_down(selected = 1){
		let html = "<strong>List Display Type: </strong>";

		let options = [

			{

				label: "Inline Lists",
				options: [

					"Circle",
					"Decimal",
					"Decimal Leading Zero",
					"Disc",
					"Lower Alpha",
					"Lower Greek",
					"Lower Roman",
					"Square",
					"Upper Alpha",
					"Upper Roman"

				]

			},


			{

				label: "Inline Misc",
				options: ["Inline Buttons"]

			}
		];

		html += "<select id='post-notes-display-type'>";

		let go = 0;
		let id = 0;

		for(let o = 0, l = options.length; o < l; ++ o){
			if(options[o].label){
				html += "<optgroup label='" + options[o].label + "'>";

				let gl = gl = options[o].options.length;

				for(go = 0; go < gl; ++ go){
					let grp_sel = ((go + id) == selected)? " selected='selected'" : "";

					html += "<option" + grp_sel + " value='" + (go + id) + "'>" + options[o].options[go] + "</option>";
				}

				id = go;

				html += "</optgroup>";
			}
		}

		html += "</select>";

		return html;
	}

	static bind_over_out($html = ""){
		$html.find(".bbc-note-box-remove").on("mouseover", function(){
			$(this).parent().addClass("bbc-note-box-over");
		}).on("mouseout", function(){
			$(this).parent().removeClass("bbc-note-box-over");
		});
	}

	static bind_remove_event($elem = null){
		let $img = ($elem)? $elem.find("img") : $(".bbc-note-box img");

		$img.on("click", function(){
			let $parent = $(this).parent();
			let $wrapper = $parent.parent();

			$parent.fadeOut("slow", () => {
				$parent.remove();

				Post_Notes_Tab.update_space();

				if($wrapper.find(".bbc-note-box").length == 0){
					let $box = $(Post_Notes_Tab.create_note_box());

					Post_Notes_Tab.bind_remove_event($box);
					Post_Notes_Tab.bind_key_events($box);
					Post_Notes_Tab.bind_over_out($box);

					$wrapper.append($box);

					$box.fadeIn();
				}
			});
		});
	}

	static bind_key_events($box = null){
		let $textareas = ($box)? $box.find("textarea") : $(".bbc-note-box textarea");

		$textareas.on("keydown keyup", this.update_space);
	}

	static create_note_box(content = "", hidden = true){
		let html = "";
		let display = (hidden)? " style='display: none;'" : "";

		html += "<span" + display + " class='bbc-note-box'><textarea>" + Post_Notes.html_encode(content) + "</textarea><img class='bbc-note-box-remove' src='" + Post_Notes.images.remove + "' /></span>";

		return html;
	}

	static update_space(){
		let $boxes = $(".bbc-note-box textarea");
		let contents = [];

		$boxes.each(function(){
			contents.push($(this).val());
		});

		if(contents.length > 0 && contents[contents.length - 1].length){
			let $box = $(Post_Notes_Tab.create_note_box());

			Post_Notes_Tab.bind_remove_event($box);
			Post_Notes_Tab.bind_key_events($box);
			Post_Notes_Tab.bind_over_out($box);

			$(".bbc-note-box-wrapper").append($box);

			$box.fadeIn("slow");
		}

		let used = JSON.stringify(contents).length;
		let left = Post_Notes.MAX_KEY_SPACE - used;

		let $counter = $("#notes-space-left");

		if(left < 0){
			$counter.addClass("notes-space-left-warn");
			$("#notes-space-left-img").addClass("notes-space-left-warn");

		} else {
			$counter.removeClass("notes-space-left-warn");
			$("#notes-space-left-img").removeClass("notes-space-left-warn");
		}

		$counter.html(left);

		Post_Notes_Tab.update_tab_count();
	}

	static bind_submit(){
		let $form = $("form.form_thread_new, form.form_post_new, form.form_post_edit, form.form_thread_edit");

		if($form.length > 0){
			let hook = $form.attr("class").match(/form_(\w+_\w+)/i)[1];

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
		let used = JSON.stringify({n: contents, t: 10}).length;
		let left = Post_Notes.MAX_KEY_SPACE - used;

		return (left < 0);
	}

	static set_on(hook){
		let post = pb.data("page").post;
		let post_id = (post && post.id)? parseInt(post.id, 10) : null;
		let contents = this.fetch_contents();
		let type = parseInt($("#post-notes-display-type").find(":selected").val() || 1, 10);

		type = (type < 0 || type > 11)? 2 : type;

		this.key.set_on(hook, post_id, {

			n: contents,
			t: type

		});
	}

	static update_tab_count(){
		$("#menu-item-post-notes-bbc-tab a").html("Notes (" + this.fetch_contents().length + ")");
	}

}