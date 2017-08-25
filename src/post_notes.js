class Post_Notes {

	static init(){
		this.PLUGIN_ID = "pd_post_notes";
		this.PLUGIN_KEY = "pd_post_notes";
		this.MAX_KEY_SPACE = parseInt(pb.data("plugin_max_key_length"), 10);

		this.images = {};

		this._textarea = document.createElement("textarea");

		this.setup();

		Post_Notes_Posts.init();
		Post_Notes_Tab.init();
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

	static fetch_notes(post_id){
		if(!post_id){
			return {};
		}

		let data = pb.plugin.key(Post_Notes.PLUGIN_KEY).get(post_id);

		if(data && data.n){
			return data;
		}

		return {};
	}

	static parse_note(note = ""){
		return pb.text.nl2br(this.html_encode(note));
	}

}