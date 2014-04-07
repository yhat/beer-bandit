import numpy as np

class EpsilonGreedy(object):
    def __init__(self,n,decay=100):
        self.counts = [0] * n
        self.values = [0.] * n
        self.decay = decay
        self.n = n

    def get_epsilon(self):
        total = np.sum(self.counts)
        return float(self.decay) / (total + float(self.decay))
    
    def choose_arm(self):
        epsilon = self.get_epsilon()
        if np.random.random() > epsilon:
            return np.argmax(self.values)
        else:
            return np.random.randint(self.n)
    
    def update(self,arm,reward):
        self.counts[arm] = self.counts[arm] + 1
        n = self.counts[arm]
        value = self.values[arm]
        new_value = ((n - 1) / float(n)) * value + (1 / float(n)) * reward
        self.values[arm] = new_value
