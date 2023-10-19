Project:

    actions.project.create
    actions.project.open
    actions.project.close

    events.project.change

Panels

    actions.panel.open

File

    events.file.open(filepath)
    events.file.create({parentNode, filepath})
    events.file.delete({parentNode, filepath})

Folder

    events.folder.create(folderpath)

Settings
    
    actions.settings.open

Log

    actions.log.add({msg, text, date})


--------------------------------------------
Commands/Events:

    editor.setTheme
    editor.showGutter
    editor.showLineNumbers
    editor.showIndent
    editor.showStatusBar

    editor.openFindPanel
    editor.openReplacePanel