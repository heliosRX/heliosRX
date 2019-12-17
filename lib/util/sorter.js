// TODO: Don't export as default, so single functions can be imported

export default {
  sorter: {
    by_rank(a, b) {
      if (a.rank < b.rank) return -1;
      if (a.rank > b.rank) return 1;
      return 0;
    },
    by_meta_sortidx(a, b) {
      if (a.meta.sortidx < b.meta.sortidx) return -1;
      if (a.meta.sortidx > b.meta.sortidx) return 1;
      return 0;
    },
    by_sortidx(a, b) {
      if (a.sortidx < b.sortidx) return -1;
      if (a.sortidx > b.sortidx) return 1;
      return 0;
    },
    by_startDate(a, b) {
      if (+a.startDate < +b.startDate) return -1;
      if (+a.startDate > +b.startDate) return 1;
      return 0;
    },
    by_endDate(a, b) {
      if (+a.endDate < +b.endDate) return -1;
      if (+a.endDate > +b.endDate) return 1;
      return 0;
    },
    by_finishDate(a, b) {
      if (+a.finishDate < +b.finishDate) return -1;
      if (+a.finishDate > +b.finishDate) return 1;
      return 0;
    },
    by_createdAt(a, b) {
      if (+a.createdAt < +b.createdAt) return -1;
      if (+a.createdAt > +b.createdAt) return 1;
      return 0;
    },
    by_startedAt(a, b) {
      if (+a.startedAt < +b.startedAt) return -1;
      if (+a.startedAt > +b.startedAt) return 1;
      return 0;
    },
    by_rank_and_sortidx(a, b) {
      // Sort by rank
      // If the first item has a higher number, move it down
      // If the first item has a lower number, move it up
      if (a.rank > b.rank) return 1;
      if (a.rank < b.rank) return -1;

      // If the rank is the same between both items, sort by sortidx
      if (a.sortidx > b.sortidx) return 1;
      if (a.sortidx < b.sortidx) return -1;

      return 0;
    }
  },

  fieldSorter(fields) {
    var dir = [];
    var i = fields.length;
    var l = fields.length;
    fields = fields.map(function(o, i) {
      if (o[0] === "-") {
        dir[i] = -1;
        o = o.substring(1);
      } else {
        dir[i] = 1;
      }
      return o;
    });

    return function (a, b) {
      for (i = 0; i < l; i++) {
        var o = fields[i];
        if (a[o] > b[o]) return dir[i];
        if (a[o] < b[o]) return -(dir[i]);
      }
      return 0;
    };
  },
};
