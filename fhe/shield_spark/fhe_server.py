
"""
Very simple HTTP server in python.
Usage::
    ./dummy-web-server.py [<port>]
Send a GET request::
    curl http://localhost
Send a HEAD request::
    curl -I http://localhost
Send a POST request::
    curl -d "foo=bar&bin=baz" http://localhost
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
import socketserver
import cgi
import fhe
import urllib
import json

class S(BaseHTTPRequestHandler):

	def _bad_params(self):
		self.send_response(422)
		self.send_header('Content-type', 'text/html')
		self.end_headers()


	def _internal_err(self):	
		self.send_response(500)
		self.send_header('Content-type', 'text/html')
		self.end_headers()

	def _set_headers(self):
		self.send_response(200)
		self.send_header('Content-type', 'text/html')
		self.end_headers()

	def _set_headers_json(self):
		self.send_response(200)
		self.send_header('Content-type', 'application/json')
		self.end_headers()

	def do_GET(self):
		self._set_headers()
		self.wfile.write( ("NO GET!").encode('utf-8'))

	def do_HEAD(self):
		self._set_headers()

	def do_POST(self):
		length = int(self.headers['Content-Length'])
		# post_data = urllib.parse.parse_qs(self.rfile.read(length).decode('utf-8'))
		post_data = json.loads(self.rfile.read(length).decode('utf-8'))


		# self._set_headers()
		form = cgi.FieldStorage(
			# fp=self.rfile,
			# headers=self.headers,
			# environ={'REQUEST_METHOD': 'POST'}
		)
		operation 	= post_data['operation']

		argOne 		= None
		argTwo 		= None
		argThree 	= None
		if operation == 'cryptocontext':
			print("HERERE 5555")
		elif operation == 'keygen':
			argOne = post_data['cryptocontext']
			# print(post_data['cryptocontext']['data']);

		elif operation == 'encrypt':
			argOne 		= post_data['cryptocontext']
			argTwo 		= post_data['publickey']
			argThree 	= post_data['plaintext']

			# argOne 		= post_data['cryptocontext'][0]
			# argTwo 		= post_data['publickey'][0]
			# argThree 	= post_data['plaintext'][0]

		elif operation == 'decrypt':
			argOne 		= post_data['cryptocontext']
			argTwo 		= post_data['privatekey']
			argThree 	= post_data['ciphertext']
		else:
			self._bad_params()
			self.wfile.write(('Bad operation supplied.').encode('utf-8'))
			return

		ret = fhe.doOperationToStringSerialization(operation, argOne, argTwo, argThree)

		if not isinstance(ret, str) or (isinstance(ret, int) and ret < 0):
			self._internal_err()
			self.wfile.write(('Invalid return.').encode('utf-8'))
			return

		self._set_headers_json()
		self.wfile.write(ret.encode('utf-8'))

def run(server_class=HTTPServer, handler_class=S, port=8082):
	server_address = ('', port)
	httpd = server_class(server_address, handler_class)
	print('Starting httpd on port ' + str(port) + "...")
	httpd.serve_forever()

if __name__ == "__main__":
	from sys import argv

	if len(argv) == 2:
		run(port=int(argv[1]))
	else:
		run()