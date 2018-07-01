
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
		self.wfile.write( ("NO GET!").encode('latin-1'))

	def do_HEAD(self):
		self._set_headers()

	def do_POST(self):
		length = int(self.headers['Content-Length'])
		post_data = urllib.parse.parse_qs(self.rfile.read(length).decode('latin-1'))
		# print(post_data)
		
		# self._set_headers()
		form = cgi.FieldStorage(
			# fp=self.rfile,
			# headers=self.headers,
			# environ={'REQUEST_METHOD': 'POST'}
		)
		operation 	= post_data['operation'][0]
		print("opp: " + operation[0])
		argOne 		= None
		argTwo 		= None
		argThree 	= None
		if operation == 'cryptocontext':
			print("HERERE 5555")
			argOne 		= None
		elif operation == 'keygen':
			print("HERERE 66666")
			argOne = post_data['cryptocontext'][0]

		elif operation == 'encrypt':
			print("HERERE 7777")
			argOne 		= post_data['cryptocontext'][0]
			argTwo 		= post_data['publickey'][0]
			argThree 	= post_data['plaintext'][0]

		elif operation == 'decrypt':
			print("HERERE 88888")
			argOne 		= post_data['cryptocontext'][0]
			argTwo 		= post_data['privatekey'][0]
			argThree 	= post_data['ciphertext'][0]
		else:
			self._bad_params()
			self.wfile.write(('Bad operation supplied.').encode('latin-1'))
			return

		ret = fhe.doOperationToStringSerialization(operation, argOne, argTwo, argThree)

		if not isinstance(ret, str) or (isinstance(ret, int) and ret < 0):
			self._internal_err()
			self.wfile.write(('Invalid return.').encode('latin-1'))
			return

		self._set_headers_json()
		self.wfile.write(ret.encode('latin-1'))

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