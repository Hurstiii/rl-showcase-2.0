import gym


class FrozenLakeWrapper():
    def __init__(self, map_name="4x4", is_slippery=True, desc=None):
        print(is_slippery)
        self.type = "FrozenLake"
        self.env = gym.make("FrozenLake-v0", map_name=map_name,
                            is_slippery=is_slippery, desc=desc)
        self.map = self.env.desc
        self.action_space = self.env.action_space
        self.observation_space = self.env.observation_space
        # self.shape = {"nrows": int(env.nrows), "ncols": int(env.ncols)}

    def serialize(self):
        env = {}
        env["type"] = self.type
        env["map"] = [[char.decode("utf-8") for char in line]
                      for line in self.map.tolist()]
        env["action_space"] = [i for i in range(self.action_space.n)]
        env["observation_space"] = [i for i in range(self.observation_space.n)]
        # print(env)
        return env
        # env["shape"] = self.shape
