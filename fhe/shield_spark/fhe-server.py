
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


		self._set_headers()
		form = cgi.FieldStorage(
			fp=self.rfile,
			headers=self.headers,
			environ={'REQUEST_METHOD': 'POST'}
		)
		operation 	= form.getvalue('operation')
		argOne 		= None
		argTwo 		= None
		argThree 	= None
		if operation == 'cryptocontext':
			argOne 		= None
		elif operation == 'keygen':
			argOne = form.getvalue('cryptocontext')

		elif operation == 'encrypt':
			argOne 		= form.getvalue('cryptocontext')
			argTwo 		= form.getvalue('publickey')
			argThree 	= form.getvalue('plaintext')

		elif operation == 'decrypt':
			argOne 		= form.getvalue('cryptocontext')
			argTwo 		= form.getvalue('privatekey')
			argThree 	= form.getvalue('ciphertext')
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