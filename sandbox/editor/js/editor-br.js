YUI.add('editor-br', function(Y) {


    /**
     * Plugin for Editor to normalize BR's.
     * @module editor
     * @submodule editor-br
     */     
    /**
     * Plugin for Editor to normalize BR's.
     * @class Plugin.EditorBR
     * @extends Base
     * @constructor
     */


    var EditorBR = function() {
        EditorBR.superclass.constructor.apply(this, arguments);
    }, HOST = 'host', LI = 'li';


    Y.extend(EditorBR, Y.Base, {
        /**
        * Frame keyDown handler that normalizes BR's when pressing ENTER.
        * @private
        * @method _onKeyDown
        */
        _onKeyDown: function(e) {
            if (e.keyCode == 13) {
                var host = this.get(HOST), inst = host.getInstance(),
                    sel = new inst.Selection();

                if (sel) {
                    if (Y.UA.ie) {
                        if (!sel.anchorNode.test(LI) && !sel.anchorNode.ancestor(LI)) {
                            sel._selection.pasteHTML('<br>');
                            sel._selection.collapse(false);
                            sel._selection.select();
                            e.halt();
                        }
                    }
                    if (Y.UA.webkit) {
                        if (!sel.anchorNode.test(LI) && !sel.anchorNode.ancestor(LI)) {
                            host.frame._execCommand('insertlinebreak', null);
                            e.halt();
                        }
                    }
                }
            }
        },
        /**
        * Adds listeners for keydown in IE and Webkit. Also fires insertbeonreturn for supporting browsers.
        * @private
        * @method _afterEditorReady
        */
        _afterEditorReady: function() {
            var inst = this.get(HOST).getInstance();
            try {
                inst.config.doc.execCommand('insertbronreturn', null, true);
            } catch (bre) {};

            if (Y.UA.ie || Y.UA.webkit) {
                inst.on('keydown', Y.bind(this._onKeyDown, this), inst.config.doc);
            }
        },
        initializer: function() {
            var host = this.get(HOST);
            if (host.editorPara) {
                Y.error('Can not plug EditorBR and EditorPara at the same time.');
                return;
            }
            host.after('ready', Y.bind(this._afterEditorReady, this));
        }
    }, {
        /**
        * editorBR
        * @static
        * @property NAME
        */
        NAME: 'editorBR',
        /**
        * editorBR
        * @static
        * @property NS
        */
        NS: 'editorBR',
        ATTRS: {
            host: {
                value: false
            }
        }
    });
    
    Y.namespace('Plugin');
    
    Y.Plugin.EditorBR = EditorBR;

    if (Y.UA.ie) {
        var handleLists = function(cmd, tag) {
            var inst = this.getInstance(),
                host = this.get(HOST),
                sel = new inst.Selection();

            if (sel.isCollapsed) {
                host.exec.command('inserthtml', '<' + tag + ' id="yui-ie-list"><li></li></' + tag + '>');
                inst.on('available', function() {
                    this.set('id', '');
                    this.one('li').append(this.get('nextSibling')).append(inst.Selection.CURSOR);
                    sel.focusCursor();
                }, '#yui-ie-list');
            } else {
                host.exec._command(cmd, '');
            }
        };
        Y.Plugin.ExecCommand.COMMANDS.insertunorderedlist = function(cmd, val) {
            handleLists.call(this, cmd, 'ul');
        };
        Y.Plugin.ExecCommand.COMMANDS.insertorderedlist = function(cmd, val) {
            handleLists.call(this, cmd, 'ol');
        };
    }

}, '1.0.0', {requires: ['editor-base', 'selection']});
