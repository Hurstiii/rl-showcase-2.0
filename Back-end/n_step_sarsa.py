import numpy as np
from tornado.escape import json_encode
import json


class NStepSarsa():

    def __init__(self, env, n=4, epsilon=0.2, alpha=0.1, gamma=0.9):
        print(n)
        self.env = env
        self.AS = [i for i in range(env.action_space.n)]
        self.OS = [i for i in range(env.observation_space.n)]
        self.Q = {}
        self.pi = {}
        # set algorithm parameters
        self.n = n
        self.epsilon = epsilon
        self.alpha = alpha
        self.gamma = gamma
        self.fullReset()
        self.finished = False
        self.stepResults = {}

        print("created agent")

    def resetLearning(self):
        # Arbitrarily set Q
        for state in self.OS:
            for action in self.AS:
                self.Q[(state, action)] = 0

        # update pi to be greedy w.r.t Q
        self.updateGreedyPi()

    def epReset(self):
        self.T = float("inf")
        self.t = 0
        self.tau = 0
        self.S = [0 for i in range(self.n+1)]
        self.A = [0 for i in range(self.n+1)]
        self.A[0] = self.piAction(0)
        self.R = [0 for i in range(self.n+1)]
        self.stepResults = {}
        self.finished = False

        self.env.reset()

    def fullReset(self):
        self.resetLearning()
        self.epReset()

    def updateGreedyPi(self):
        for state in self.OS:
            bestActions = []
            bestValue = self.Q[(state, 0)]
            for action in self.AS:
                currentValue = self.Q[(state, action)]
                if currentValue == bestValue:
                    bestActions.append(action)
                elif currentValue > bestValue:
                    bestActions = [action]
                    bestValue = currentValue

            bestAction = np.random.choice(bestActions)

            for action in self.AS:
                if action == bestAction:
                    self.pi[(state, action)] = 1 - self.epsilon + \
                        self.epsilon / len(self.AS)
                else:
                    self.pi[(state, action)] = self.epsilon / len(self.AS)

    def piAction(self, state):
        weights = [self.pi[(state, action)] for action in self.AS]
        return int(np.random.choice([action for action in self.AS], p=weights))

    def learn(self):
        def ind(index):
            return index % (self.n + 1)

        if self.t < self.T:
            [obs, rew, done, info] = self.env.step(self.A[ind(self.t)])
            self.stepResults = {"obs": obs,
                                "rew": rew, "done": done, "info": info}
            self.S[ind(self.t + 1)] = obs
            self.R[ind(self.t + 1)] = rew

            if done:
                self.T = self.t + 1
            else:
                self.A[ind(self.t + 1)] = self.piAction(obs)

        self.tau = self.t - self.n + 1
        if self.tau >= 0:
            G = 0
            for i in range(self.tau+1, min(self.tau+self.n, self.T)+1):
                G = G + pow(self.gamma, i - self.tau - 1) * self.R[ind(i)]

            if self.tau + self.n < self.T:
                state = self.S[ind(self.tau+self.n)]
                action = self.A[ind(self.tau + self.n)]
                q = self.Q[(state, action)]
                G += pow(self.gamma, self.n) * q

            state = self.S[ind(self.tau)]
            action = self.A[ind(self.tau)]
            _q = self.Q[(state, action)]
            _q = _q + self.alpha * (G - _q)
            self.Q[(state, action)] = _q

            self.updateGreedyPi()

        if self.tau == self.T - 1:
            print("Reached a terminal state")
            self.finished = True
            return

        print("t increase")
        self.t += 1
        self.finished = False
        return

    def step(self):
        if self.finished:
            self.epReset()
        else:
            self.learn()
        return self.serializeFullState()

    def serializeFullState(self):
        return {"Terminated": self.finished, "stepResults": self.stepResults, "agentState": self.serializeState()}

    def serializeState(self):
        print("assembling")
        state = {}
        state["t"] = self.t
        if self.T == float("inf"):
            state["T"] = "inf"
        else:
            state["T"] = self.T
        state["tau"] = self.tau
        state["A"] = self.A
        state["S"] = self.S
        state["R"] = self.R
        state["Q"] = {str(k): v for k, v in self.Q.items()}
        state["pi"] = {str(k): v for k, v in self.pi.items()}
        state["epsilon"] = self.epsilon
        state["n"] = self.n
        state["alpha"] = self.alpha
        state["gamma"] = self.gamma
        return state
