class Post_Notes_Posts {

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
		this.add_notes_to_posts();

		pb.events.on("afterSearch", this.add_notes_to_posts);
	}

	static add_notes_to_posts(){
		let $post_rows = $("tr.item.post");

		$post_rows.each(function(){
			let post_id = parseInt($(this).attr("id").split("-")[1] || "", 10);

			if(post_id){
				let post_notes = Post_Notes.fetch_notes(post_id);
				let notes = post_notes.n || [];
				let type = parseInt(post_notes.t || 1, 10);

				if(notes.length > 0){
					let $article = $(this).find("article");

					if($article.length == 1){
						let the_notes = Post_Notes_Posts.create_notes(notes, type);

						$article.append(the_notes);
					}
				}
			}
		})
	}

	static fetch_list_type(type = 2){
		let list_type = "";

		"Circle Inline List",
			"Decimal Inline List",
			"Decimal Leading Zero List",
			"Disc Inline List",
			"Lower Alpha Inline List",
			"Lower Greek Inline List",
			"Lower Roman Inline List",
			"Square Inline List",
			"Upper Alpha Inline List",
			"Upper Roman Inline List"

		switch(type){

			case 1 :
				list_type = "circle";
				break;

			case 3 :
				list_type = "decimal-leading-zero";
				break;

			case 4 :
				list_type = "disc";
				break;

			case 5 :
				list_type = "lower-alpha";
				break;

			case 6 :
				list_type = "lower-greek";
				break;

			case 7 :
				list_type = "lower-lower-roman";
				break;

			case 8 :
				list_type = "square";
				break;

			case 9 :
				list_type = "upper-alpha";
				break;

			case 10 :
				list_type = "upper-roman";
				break;

		}

		return list_type;
	}

	static create_notes(notes = [], type = 1){
		let type_class = this.fetch_list_type(type);
		let html = "<div class='post-notes'><ol class='" + type_class + "'>";

		for(let n = 0, l = notes.length; n < l; ++ n){
			html += "<li>" + Post_Notes.parse_note(notes[n]) + "</li>";
		}

		html += "</ol></div>";

		return html;
	}

}