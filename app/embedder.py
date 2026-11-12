"""Pluggable embedders. The default is a lexical TF-IDF stand-in.
Swap in a real multilingual model with SIAAJ_EMBEDDER=st (UNTESTED here: no model download access)."""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer


def _norm(x):
    n = np.linalg.norm(x, axis=1, keepdims=True)
    n[n == 0] = 1
    return x / n


class TfidfEmbedder:
    def fit(self, texts):
        self.v = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True).fit(texts)
        return self

    def encode(self, texts):
        return _norm(self.v.transform(texts).toarray())


class SentenceTransformerEmbedder:
    def __init__(self, model_name):
        from sentence_transformers import SentenceTransformer  # optional dependency
        self.m = SentenceTransformer(model_name)

    def fit(self, texts):
        return self

    def encode(self, texts):
        return _norm(np.asarray(self.m.encode(list(texts))))


def make_embedder(settings):
    if settings.embedder == "st":
        return SentenceTransformerEmbedder(settings.st_model)
    return TfidfEmbedder()
