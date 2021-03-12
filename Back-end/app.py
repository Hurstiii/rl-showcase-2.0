from typing import Dict
from tornado.escape import json_decode
import tornado.ioloop
import tornado.websocket
import gym
from n_step_sarsa import NStepSarsa
from FrozenLakeWrapper import FrozenLakeWrapper
from utils import setInterval
from jsonschema import validate

messageSchema = {
    "type": "object",
    "properties": {
        "request": {
            "type": "string"
        },
        "data": {
            "type": "object"
        }
    },
    "required": ["request"]
}


# instantiate the default environment.
class MainHandler(tornado.websocket.WebSocketHandler):
    def __init__(self, *args, **kwargs):
        self.sim = tornado.ioloop.PeriodicCallback(self.stepAndUpdate, 800)
        self.simulating = False
        self.env = FrozenLakeWrapper()
        self.a = NStepSarsa(self.env.env)
        super(MainHandler, self).__init__(*args, **kwargs)

    def __del__(self):
        if hasattr(self, 'inter') and self.inter != None:
            self.inter.cancel()

    def getAgentEnvState(self):
        a_state = self.a.serializeFullState()
        data = {**a_state, **self.env.serialize()}
        print('{}'.format(data))
        return data

    def stepAndUpdate(self):
        self.a.step()
        data = self.getAgentEnvState()
        self.write_message(data)

    def startSimulating(self):
        print("starting simulating")
        self.sim.start()

    def stopSimulating(self):
        if self.sim.is_running():
            self.sim.stop()

    def handleStep(self):
        print("step")
        self.stepAndUpdate()

    def handleSimulate(self):
        print("toggle simulating")
        self.simulating = not self.simulating
        if self.simulating:
            self.startSimulating()
        else:
            self.stopSimulating()

    def handleReset(self, params: Dict = {"agent": {}, "env": {}}):
        print("resetting")
        if params["env"]:
            self.env = FrozenLakeWrapper(**params["env"])
        self.a = NStepSarsa(self.env.env, **params["agent"])
        data = self.getAgentEnvState()
        self.write_message(data)

    def handleParams(self, params: Dict[str, Dict]):
        print("params")
        print(params)
        self.handleReset(params)

    def handleBadRequest(self):
        print("bad request")
        self.close(400)

    @classmethod
    def urls(cls):
        return [
            (r'/', cls, {}),  # Route/Handler/kwargs
        ]

    def open(self):
        self.write_message(self.getAgentEnvState())

    def on_message(self, message):
        json_message = json_decode(message)
        print(json_message)
        try:
            validate(json_message, schema=messageSchema)
            request = json_message["request"]
            if request == "step":
                self.handleStep()
            elif request == "simulate":
                self.handleSimulate()
            elif request == "reset":
                self.handleReset()
            elif request == "params":
                params = json_message["data"]
                self.handleParams(params)
        except():
            self.handleBadRequest()

    def on_close(self):
        print("WebSocket closed")

    def check_origin(self, origin: str) -> bool:
        print("checking origin")
        return True


if __name__ == "__main__":
    app = tornado.web.Application(MainHandler.urls())

    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(8888)

    print("Now listening on localhost:8888")
    tornado.ioloop.IOLoop.current().start()
