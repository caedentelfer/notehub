from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/no-content', methods=['GET'])
def no_content():
    return '', 204  

if __name__ == '__main__':
    app.run(port=5000)



# Explanation of the bug #

#  axios is mishandling the 204 response by attempting to parse a non-existent body.
#  When axios.get() is called, it throws an error because it expects a body but receives none

