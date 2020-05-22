/*
  MIT License

  Copyright (c) 2020 David MacCormack

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/* eslint-disable no-undef */
const INITIAL_VALUE = { Hello: "World!" };
const SYNTAX_OK = "Syntax OK!";

//
// dynamically inject CSS into <HEAD>
//
function addCSS(filename) {
  const head = document.getElementsByTagName("head")[0];
  const s = document.createElement("link");
  s.setAttribute("type", "text/css");
  s.setAttribute("rel", "stylesheet");
  s.setAttribute("href", filename);
  head.appendChild(s);
}

//
// inject sandbox CSS
//
addCSS("sandbox.css");

//
// Codebox component
//
const jsonurlAppCodebox = {
  props: {
    isJsonUrl: Boolean,
  },
  data: function () {
    return {
      isLoading: false,
      text: "",
    };
  },
  created: function () {
    if (this.isJsonUrl) {
      this.text = JsonURL.stringify(INITIAL_VALUE);
    } else {
      this.text = JSON.stringify(INITIAL_VALUE);
    }
  },
  computed: {
    id: function () {
      return this.isJsonUrl ? "jsonUrlText" : "jsonText";
    },
    placeholder: function () {
      return this.isJsonUrl ? "JSON->URL Text" : "JSON Text";
    },
    label: function () {
      return this.isJsonUrl ? "JSON->URL" : "JSON";
    },
  },
  methods: {
    updateText: function () {
      const sandbox = this.$parent;

      if (this.isJsonUrl) {
        sandbox.$refs.jsonCode.isLoading = true;
        sandbox.dbProcessJsonUrlText();
      } else {
        sandbox.$refs.jsonUrlCode.isLoading = true;
        sandbox.dbProcessJsonText();
      }
    },
  },
  template:
    "\
<div class='codebox'>\
	<label :for='id'>{{ label }}: </label>\
	<span class='spinbox'>\
    	<span :class=\"{ 'lds-dual-ring': isLoading }\"></span></span>\
	<textarea\
		:id='id' :name='id' :placeholder='placeholder' v-model='text'\
		spellcheck='false' rows='10' cols='40' maxlength='4096'\
		@input='updateText()'></textarea>\
</div>",
};

//
// root Vue component (the Sandbox)
//
new Vue({
  el: "#sandbox",
  data: {
    jsonUrlParser: new JsonURL(),
    jsonSyntaxOK: true,
    jsonSyntaxError: SYNTAX_OK,
  },
  components: {
    "jsonurl-codebox": jsonurlAppCodebox,
  },
  methods: {
    dbProcessJsonText: _.debounce(function () {
      const jsonCode = this.$refs.jsonCode;
      const jsonUrlCode = this.$refs.jsonUrlCode;

      try {
        const jsonValue = JSON.parse(jsonCode.text);
        jsonUrlCode.text = JsonURL.stringify(jsonValue);
        this.jsonSyntaxOK = true;
        this.jsonSyntaxError = SYNTAX_OK;
      } catch (e) {
        this.jsonSyntaxOK = false;
        this.jsonSyntaxError = e;
      }
      jsonUrlCode.isLoading = false;
    }, 500),
    dbProcessJsonUrlText: _.debounce(function () {
      const jsonCode = this.$refs.jsonCode;
      const jsonUrlCode = this.$refs.jsonUrlCode;

      try {
        const jsonValue = this.jsonUrlParser.parse(jsonUrlCode.text);
        jsonCode.text = JSON.stringify(jsonValue);
        this.jsonSyntaxOK = true;
        this.jsonSyntaxError = SYNTAX_OK;
      } catch (e) {
        this.jsonSyntaxOK = false;
        this.jsonSyntaxError = e;
      }
      jsonCode.isLoading = false;
    }, 500),
    getSyntaxClass: function (v) {
      return {
        syntaxok: this[v] === true,
        syntaxerr: this[v] === false,
      };
    },
  },
  template:
    "\
<section id='sandbox'>\
  <h2><a name='sandbox' href='#sandbox'>Playground</a></h2>\
  <div id='sandbox-body'>\
  <jsonurl-codebox ref='jsonCode' :isJsonUrl='false' />\
  <jsonurl-codebox ref='jsonUrlCode' :isJsonUrl='true' />\
  </div>\
  <div id='sandbox-msg'>\
	<span :class=\"getSyntaxClass('jsonSyntaxOK')\">{{ jsonSyntaxError }}</span>\
  </div>\
</section>\
",
});

