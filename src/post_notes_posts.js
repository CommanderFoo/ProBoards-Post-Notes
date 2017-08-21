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

				if(post_notes.length > 0){
					let $article = $(this).find("article");

					if($article.length == 1){
						let notes = Post_Notes_Posts.create_cited_notes(post_notes);

						$article.append(notes);
					}
				}
			}
		})
	}

	static create_cited_notes(notes = []){
		let html = "<div class='post-notes'><ol>";

		for(let n = 0, l = notes.length; n < l; ++ n){
			html += "<li>" + Post_Notes.parse_note(notes[n]) + "</li>";
		}

		html += "</ol></div>";

		return html;
	}

}