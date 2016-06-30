from app import create_app, db
from flask.ext.script import Manager, Shell, Server

app = create_app('dev')
manager = Manager(app)


def _make_shell_context():
    return {'app': app, 'db': db }


manager.add_command("shell", Shell(make_context=_make_shell_context))
manager.add_command("runserver", Server(host="0.0.0.0", port=5000, use_debugger=True))

if __name__ in '__main__':
    manager.run()
